# HoH — Authentication Architecture

**Status:** Implemented & verified end-to-end
**Model:** Session-backed JWT with refresh-token rotation, reuse detection, and httpOnly-cookie transport
**Last updated:** 2026-07-03

---

## 1. Overview

HoH uses **session-backed JWT authentication**. Every login creates a row in a `Session` table. Both the access token and the refresh token carry that session's id, and the middleware validates the session on **every** protected request. This is what lets us revoke access instantly (logout, password change, admin lock) — a signature-only JWT check cannot do that.

Key properties:

| Property | How |
|---|---|
| **Stateless-ish speed** | Access token verified by signature; one indexed session lookup per request |
| **Instant revocation** | Session row checked live → revoke = immediate lockout |
| **Refresh rotation** | Every refresh issues a new refresh token and invalidates the old one |
| **Reuse detection** | Replaying an old refresh token revokes the entire session |
| **XSS-safe transport** | Refresh token lives in an httpOnly cookie, never in JS-readable storage |
| **Multi-device** | Each login is its own session; devices are independent |
| **Roles** | `ROLE_USER` / `ROLE_ADMIN` carried in the token, re-read from DB in middleware |
| **Leak-resistant passwords** | HMAC-pepper → bcrypt; refresh tokens stored only as SHA-256 hashes |

---

## 2. Token model

There are **two** JWTs plus **one** DB session.

```
┌──────────────────────────────────────────────────────────────────────┐
│ ACCESS TOKEN (JWT, ~1 hour)                                           │
│   payload: { userId, sessionId, role, iat, exp }                     │
│   secret : JWT_SECRET            algorithm: HS256                     │
│   sent as: Authorization: Bearer <token>   (held in memory by the FE)│
│   purpose: authorize every API call                                  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ REFRESH TOKEN (JWT, 7 days)                                          │
│   payload: { userId, sessionId, jti, iat, exp }                     │
│   secret : JWT_REFRESH_SECRET    algorithm: HS256                    │
│   sent as: httpOnly cookie  (path=/api/v1/auth/refresh)             │
│   purpose: mint a new access token when it expires                   │
│   note   : jti (random per token) guarantees every refresh token is  │
│            unique, so rotation always produces a distinct value      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ SESSION (DB row, table `sessions`)                                   │
│   id, userId, refreshHash (SHA-256 of current refresh token),        │
│   ipAddress, userAgent, revoked, expiresAt, createdAt, updatedAt     │
│   purpose: the source of truth. The refresh JWT is only "valid" if   │
│            its hash still matches refreshHash AND revoked = false.    │
└──────────────────────────────────────────────────────────────────────┘
```

Why two secrets? A leaked `JWT_SECRET` can't be used to forge refresh tokens, and vice-versa.

Why store only a hash of the refresh token? If the `sessions` table leaks, the hashes can't be replayed as tokens.

---

## 3. Component map

```
                         ┌───────────────────────────────┐
  HTTP request  ───────► │  routes/auth.routes.ts        │
                         │   /register /login /refresh    │
                         │   /logout  /sendVerificationOtp│
                         └───────────────┬───────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │ controllers/auth.controller.ts │  parse input (zod),
                         │  - sets/clears refresh cookie   │  read client meta,
                         │  - returns accessToken in body  │  set httpOnly cookie
                         └───────────────┬───────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │  services/auth.service.ts      │  business logic:
                         │   register/login/refresh/logout│  hashing, sessions,
                         │   OTP flows, rotation, reuse    │  rotation + reuse
                         └───────────────┬───────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          ▼                              ▼                               ▼
 ┌─────────────────┐          ┌────────────────────┐          ┌──────────────────┐
 │ repositories/   │          │  utils/jwt.ts       │          │  utils/bcrypt.ts │
 │ auth.repo.ts    │          │  sign/verify tokens │          │  HMAC-pepper →   │
 │ (all prisma.*)  │          │  cookie options     │          │  bcrypt          │
 │ user + session  │          │  HS256 pinning      │          │                  │
 └─────────────────┘          └────────────────────┘          └──────────────────┘

 Protected routes use  middleware/auth.middleware.ts → authenticate → requireRole(...)
```

Architecture rule (repo layer): **all `prisma.*` calls live in `auth.repo.ts`**; the service never touches Prisma directly except the `$transaction` wrapper it passes into repo functions.

---

## 4. Flows

### 4.1 Signup (register) — email-OTP verified

Registration is a **three-step** flow. An account can only be created after the email is proven.

```
 Step 1: SEND OTP
   POST /api/v1/auth/sendVerificationOtp?email=a@b.com
     → service.sendVerificationOtp
         → reject if email already registered  (EMAIL_ALREADY_REGISTERED)
         → generate 6-digit OTP, upsert email_verifications, email it (Resend)
     ← 200 "OTP sent to your email."

 Step 2: VERIFY OTP
   POST /api/v1/auth/verifyOtp/:email      body: { otp }
     → service.verifyRegistrationOtp
         → check exists / not already verified / matches / not expired
         → mark email_verifications.isVerified = true
     ← 200 "Email verified successfully."

 Step 3: REGISTER
   POST /api/v1/auth/register  body: { fullName, email, password, mobile? }
     → service.register(data, ip, ua)
         → require a verified email_verifications row (EMAIL_NOT_VERIFIED)
         → hashPassword = bcrypt(HMAC_sha256(PEPPER, password))
         → create user + attach ROLE_USER
         → delete the email_verifications row
         → issueSession(userId, role, ip, ua)   ─┐
     ← 201 { user, accessToken }                  │  sets httpOnly refresh cookie
             + Set-Cookie: refresh_token=...      ─┘
```

`issueSession` (used by register **and** login), runs in one transaction:

```
  BEGIN
    session = INSERT sessions (userId, refreshHash="", ip, ua, expiresAt=+7d)
    accessToken  = signAccessToken(userId, session.id, role)   // ~1h
    refreshToken = signRefreshToken(userId, session.id)        // 7d, unique jti
    UPDATE sessions SET refreshHash = sha256(refreshToken) WHERE id = session.id
  COMMIT
  return { accessToken, refreshToken }
```

Multi-device note: `issueSession` does **not** revoke other sessions — every login is independent.

---

### 4.2 Login

```
  POST /api/v1/auth/login   body: { email, password }
    → service.login(data, ip, ua)

      user = findUserByEmail(email)
      IF no user:
          bcrypt.compare(password, DUMMY_HASH)   ← constant-time; no email enumeration
          throw INVALID_CREDENTIALS
      IF user.locked:        throw ACCOUNT_LOCKED
      IF password invalid:
          failedLoginAttempts++  (lock at 5)     ← ACCOUNT_LOCKED_NOW when threshold hit
          throw INVALID_CREDENTIALS
      reset failedLoginAttempts → 0
      issueSession(userId, role, ip, ua)

    ← 200 { user, accessToken }  + Set-Cookie: refresh_token=...(httpOnly)
```

The dummy-hash compare on the "unknown email" branch keeps response time roughly equal whether or not the email exists, defeating **timing-based email enumeration**.

---

### 4.3 Authenticated request (middleware)

Every protected route runs `authenticate` (then optionally `requireRole`).

```
  Authorization: Bearer <accessToken>
    → authenticate
        payload = verifyAccessToken(token)          // HS256; throws → mapped below
        session = findSessionWithUser(payload.sessionId)   // 1 JOIN: session + user + roles
        IF !session || session.userId !== payload.userId → 401 SESSION_INVALID
        IF session.revoked                               → 401 SESSION_REVOKED
        IF session.expiresAt < now                       → 401 SESSION_EXPIRED
        IF session.user.locked                           → 403 ACCOUNT_LOCKED
        role = session.user.roles[0].roleName            // live from DB
        req.user = { userId, role, sessionId }
        next()

  JWT verify errors are mapped precisely:
     TokenExpiredError  → 401 ACCESS_TOKEN_EXPIRED   (FE should silently refresh)
     JsonWebTokenError  → 401 INVALID_TOKEN
     NotBeforeError     → 401 TOKEN_NOT_ACTIVE
```

`requireRole("ROLE_ADMIN")` then checks `req.user.role` and returns `403 FORBIDDEN` if it doesn't match.

Role is read **live from the DB** in the middleware, so revoking an admin's role takes effect on the next request, not after token expiry.

---

### 4.4 Refresh — rotation + reuse detection

When the access token expires, the FE calls `/refresh`. The browser automatically attaches the httpOnly cookie (it's path-scoped to exactly this route).

```
  POST /api/v1/auth/refresh          (no body; cookie carries the refresh token)
    → controller reads req.cookies.refresh_token   (else INVALID_REFRESH_TOKEN)
    → service.refresh(token)

        payload = verifyRefreshToken(token)             // HS256; throws on tamper/expiry
        session = findSessionById(payload.sessionId)
        IF !session || userId mismatch     → INVALID_REFRESH_TOKEN
        IF session.revoked                 → SESSION_EXPIRED
        IF session.expiresAt < now         → SESSION_EXPIRED

        ── REUSE DETECTION ─────────────────────────────────────────────
        IF sha256(token) !== session.refreshHash:
             revokeSession(session.id)      ← someone replayed an old token
             throw INVALID_REFRESH_TOKEN       kill the session entirely
        ────────────────────────────────────────────────────────────────

        user = findUserWithRolesById(session.userId)
        IF !user → ACCOUNT_NOT_FOUND ;  IF user.locked → ACCOUNT_LOCKED

        newAccess  = signAccessToken(userId, session.id, role)   // fresh role
        newRefresh = signRefreshToken(userId, session.id)        // new jti

        ── ATOMIC ROTATION (compare-and-swap) ──────────────────────────
        n = UPDATE sessions
              SET refreshHash = sha256(newRefresh)
              WHERE id = session.id AND refreshHash = <old hash>     // CAS
        IF n == 0:                              ← a concurrent refresh already won
             revokeSession(session.id)
             throw INVALID_REFRESH_TOKEN
        ────────────────────────────────────────────────────────────────

    ← 200 { accessToken: newAccess } + Set-Cookie: refresh_token=newRefresh
```

**Why reuse detection matters.** If an attacker steals a refresh token and uses it, the real user's next refresh (or the attacker's second use) presents a hash that no longer matches → the session is revoked and **both** parties are logged out. Stolen tokens become single-use at most.

The **CAS** (`WHERE refreshHash = old`) handles two legitimate refreshes racing: exactly one updates the row; the loser gets `count = 0` and is treated as a reuse, revoking the session safely.

```
  Reuse attack timeline
  ─────────────────────
  t0  user logs in            refreshHash = H0   (token T0)
  t1  attacker steals T0
  t2  attacker refreshes T0   hash matches → rotate → refreshHash = H1 (token T1)
  t3  user refreshes T0        sha256(T0)=H0 ≠ H1  → REUSE → session revoked
        → attacker's T1 now also dead (session.revoked = true)  → both must re-login
```

---

### 4.5 Logout

```
  POST /api/v1/auth/logout      (requires a valid access token)
    → authenticate populates req.user.sessionId
    → service.logout(sessionId, userId)  → DELETE sessions WHERE id=sessionId AND userId
    → res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" })
    ← 200 "Logged out successfully."
```

Deleting the session row means the access token — even though its signature is still valid until expiry — fails the very next `authenticate` check (`SESSION_INVALID`). This is the payoff of session-backed auth.

---

### 4.6 Forgot / change password

```
  POST /api/v1/forgotPassword/verifyMail           body: { email }
      → issue reset OTP (forgot_passwords), email it
  POST /api/v1/forgotPassword/verifyOtp/:email      body: { otp }
      → validate OTP (not consumed yet)
  POST /api/v1/forgotPassword/changePassword/:email body: { otp, newPassword }
      → re-validate OTP → hash new password → update user
      → delete the reset OTP
      → revokeAllUserSessions(userId)     ← every device must re-login after a reset
```

Changing the password revokes **all** sessions for that user — a critical account-recovery safety net.

---

## 5. Password & token hashing

```
  PASSWORD (at rest)
    stored = bcrypt( HMAC_sha256(PASSWORD_PEPPER, plaintext), cost=12 )
                     └─────────────┬──────────────┘
                                   │  1. even a full DB leak can't be brute-forced
                                   │     without PASSWORD_PEPPER
                                   │  2. HMAC output is a fixed 64-char hex string,
                                   │     so bcrypt's silent 72-byte truncation
                                   │     can never clip a long password
    (utils/bcrypt.ts — the seed script uses the identical formula)

  REFRESH TOKEN (at rest)
    stored = sha256(refreshToken)      ← never the raw token
    (a leaked sessions table yields hashes, not usable tokens)
```

---

## 6. Cookie configuration

`refresh_token` cookie (`utils/jwt.ts`):

| Attribute | Value | Reason |
|---|---|---|
| `httpOnly` | `true` | JS can't read it → immune to XSS token theft |
| `secure` | `true` in production | HTTPS-only transport |
| `sameSite` | `strict` | Browser won't attach it cross-site → CSRF defence |
| `path` | `/api/v1/auth/refresh` | Sent **only** to the refresh endpoint, nowhere else |
| `maxAge` | 7 days | Matches refresh token lifetime |

Because the cookie is path-scoped, it is **not** sent on normal API calls — only the access token (Bearer header) is. This shrinks the refresh token's exposure surface to a single route.

---

## 7. Error codes

| HTTP | Code | Where | Meaning |
|---|---|---|---|
| 401 | `UNAUTHORIZED` | middleware | No `Bearer` token supplied |
| 401 | `ACCESS_TOKEN_EXPIRED` | middleware | Access token expired → FE should call `/refresh` |
| 401 | `INVALID_TOKEN` | middleware | Malformed/tampered access token |
| 401 | `TOKEN_NOT_ACTIVE` | middleware | `nbf` in the future |
| 401 | `SESSION_INVALID` | middleware | Session missing or userId mismatch (e.g. after logout) |
| 401 | `SESSION_REVOKED` | middleware | Session was revoked |
| 401 | `SESSION_EXPIRED` | middleware / refresh | Session past `expiresAt` or revoked |
| 403 | `ACCOUNT_LOCKED` | middleware / login | User is locked |
| 403 | `FORBIDDEN` | requireRole | Authenticated but wrong role |
| 401 | `INVALID_REFRESH_TOKEN` | refresh | Missing/invalid/replayed refresh token |
| 401 | `INVALID_CREDENTIALS` | login | Wrong email or password (generic on purpose) |
| 409 | `EMAIL_ALREADY_REGISTERED` | sendVerificationOtp | Email already has an account |
| 400 | `EMAIL_NOT_VERIFIED` | register | No verified OTP for this email |
| 400 | `OTP_INVALID` / `OTP_EXPIRED` | OTP flows | Bad or stale code |

Front-end rule of thumb: on `ACCESS_TOKEN_EXPIRED`, silently call `/refresh` and retry once; on any other 401 (`SESSION_*`, `INVALID_REFRESH_TOKEN`), force a re-login.

---

## 8. Front-end contract (vaultiq)

```
  LOGIN / REGISTER
    axios.post('/auth/login', body, { withCredentials: true })
    → store response.data.accessToken IN MEMORY (not localStorage)
    → refresh_token cookie is set automatically by the browser

  EVERY API CALL
    Authorization: Bearer <accessToken>
    withCredentials: true            (so the cookie rides along to /refresh)

  ON 401 ACCESS_TOKEN_EXPIRED
    axios.post('/auth/refresh', null, { withCredentials: true })
    → replace in-memory accessToken with response.data.accessToken
    → retry the original request once
    → if /refresh itself 401s → redirect to login

  LOGOUT
    axios.post('/auth/logout', null, { headers: Bearer, withCredentials: true })
    → discard the in-memory accessToken
```

The refresh token is **never** visible to JS — the frontend only ever holds the short-lived access token in memory.

---

## 9. Data model (Prisma)

```prisma
model Session {
  id          String   @id @default(uuid())
  userId      String
  refreshHash String              // sha256 of the current refresh token
  ipAddress   String?
  userAgent   String?
  revoked     Boolean  @default(false)
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}
```

Deleting a user cascades to their sessions. `@@index([userId])` keeps "revoke all my sessions" fast.

---

## 10. Operational notes

- **Stale session cleanup:** `deleteStaleSessions()` (in `auth.repo.ts`) purges rows where `expiresAt < now` OR `revoked = true`. Wire it to a daily cron so the table stays bounded.
- **Access-token lifetime:** currently 1 hour (`ACCESS_EXPIRY_MS` in `utils/jwt.ts`). With cookie-based rotation in place, shortening this (e.g. 15 min) is painless and tightens the window on a stolen access token.
- **Secrets:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PASSWORD_PEPPER` must all be ≥32 chars and distinct in production. Replace the `.env` placeholders before deploying.
- **`trust proxy`** is set in `app.ts` so `req.ip` (recorded on each session) is the real client IP behind a proxy.

---

## 11. Security checklist (what this design defends against)

| Threat | Defence |
|---|---|
| XSS stealing the refresh token | httpOnly cookie — unreadable by JS |
| CSRF on refresh | `sameSite=strict` + path-scoped cookie |
| Stolen refresh token replay | Rotation + reuse detection → session revoked |
| Stolen access token | Short 1h lifetime + instant session revocation on logout |
| DB leak → password cracking | HMAC-pepper (needs `PASSWORD_PEPPER`) + bcrypt cost 12 |
| DB leak → token replay | Only SHA-256 hashes of refresh tokens are stored |
| Email enumeration (login) | Constant-time dummy-hash compare |
| Brute-force login | Lock after 5 failed attempts |
| JWT algorithm confusion (alg:none) | `algorithms: ["HS256"]` pinned on verify |
| Long-password truncation | HMAC normalises length before bcrypt |
| Compromised account recovery | Password change revokes all sessions |
| Stale role after demotion | Role re-read from DB in middleware each request |
```
