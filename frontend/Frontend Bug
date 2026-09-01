# Frontend Integration Bugs — HohJSFE

This document lists every place where the current frontend code (as pulled from the `v2`
branch) doesn't match the real backend (**HohBE**, running at `http://localhost:3006` in
dev). Every backend endpoint referenced below exists, has been live-tested, and is
documented in Swagger (`http://localhost:3006/api/docs`) — **treat Swagger as the source
of truth for exact field names/types if anything here is ambiguous.**

Issues are grouped by severity. Fix Critical first — nothing involving login/registration
currently works end-to-end for a returning user.

---

## Critical — Auth is broken

### 1. OTP verification hits a non-existent endpoint

**File:** `src/store/slices/authSlice.js` — `verifyOtp` thunk (around line 20)

```js
// current (broken)
const response = await api.post("/auth/verifyOtp", { email, otp: Number(otp) });
```

The real route is `POST /auth/verifyOtp/:email` — **email is a URL path segment, not a
body field.** The body is just `{ otp: number }`. As written, this call 404s.

**Fix:**
```js
const response = await api.post(`/auth/verifyOtp/${encodeURIComponent(email)}`, {
  otp: Number(otp),
});
```

Also note what this endpoint actually does: it only verifies that the user owns the
email address as part of **registration**. On success it returns
`{ message: "Email verified successfully." }` — no tokens, no user object, and it does
not log anyone in. See bug #3 for why this matters.

---

### 2. OTP input UI only accepts 4 digits

**File:** `src/components/common/Popup/OtpStep.jsx`, line 5:

```js
// Set to 4 digits as per backend schema
const OTP_LENGTH = 4;
```

That comment is wrong. The backend **always** generates and validates 6-digit OTPs:

- Generation: `randomInt(100000, 1000000)` (registration, login, and forgot-password OTPs all use this)
- Validation: `z.number().int().min(100000).max(999999)` on every OTP-verify endpoint

With a 4-box input, a user can never type a code the backend will accept.

**Fix:** change `OTP_LENGTH` to `6`.

---

### 3. No login flow exists — returning users cannot sign in

**Files:** `src/store/slices/authSlice.js`, `src/components/common/Popup/AuthPopup.jsx`

The current popup implements exactly one flow end-to-end: send-registration-OTP →
verify → register. There is **no thunk and no API call anywhere** for logging in an
existing user.

**What happens today if an existing user tries to "log in":** they type their email in
the EMAIL step, which calls `sendVerificationOtp`. The backend rejects this with
`409 EMAIL_ALREADY_REGISTERED` because that endpoint is registration-only — the user
never even reaches an OTP screen.

**The backend has a separate, working login-via-OTP flow that isn't called from
anywhere in the frontend:**

| Endpoint | Notes |
|---|---|
| `POST /auth/login/otp/send?email=<email>` | Email is a **query param**, not a body field. Always responds `200 { message: "If this account exists, an OTP has been sent." }` regardless of whether the account exists or not — this is deliberate anti-enumeration, don't treat the response as confirming the email is real. |
| `POST /auth/login/otp/verify/:email` | Body: `{ otp: number }` (6 digits). On success: `{ user, accessToken }` — same shape as register — and sets the `refresh_token` httpOnly cookie. Failure cases: `400 OTP_INVALID`, `404 OTP_NOT_REQUESTED` (no OTP pending / already used), `404 ACCOUNT_NOT_FOUND`, `403 OTP_LOGIN_NOT_ALLOWED` (this email belongs to an **admin** account — admins sign in with a password via `POST /auth/login`, never OTP). |

**Recommended fix — keep the existing single "enter your email" UI, but branch based on
what the backend tells you:**

1. User submits email in the EMAIL step (unchanged UI).
2. Call `POST /auth/sendVerificationOtp?email=<email>` (note: query param, same as today).
   - **Success (200)** → this is a new user. Proceed exactly as today: OTP step →
     `POST /auth/verifyOtp/:email` → DETAILS step → `POST /auth/register`.
   - **Failure `409 EMAIL_ALREADY_REGISTERED`** → this is an existing user. Instead call
     `POST /auth/login/otp/send?email=<email>`, then go to the OTP step. On submit, call
     `POST /auth/login/otp/verify/:email` — this **does** return `{ user, accessToken }`,
     so log the user in immediately and skip the DETAILS step entirely.
3. Track which of the two flows you're in (e.g. `flow: 'register' | 'login'` state in
   `AuthPopup.jsx`, set right after step 2) so the OTP step's submit handler knows which
   verify endpoint to call.
4. Add two new thunks mirroring the existing ones — e.g. `sendLoginOtp` and
   `verifyLoginOtp` — following the same pattern as `sendVerificationOtp`/`verifyOtp`.

---

### 4. Dead branch logic in `verifyOtp.fulfilled`

**File:** `src/store/slices/authSlice.js`, around line 156:

```js
const { user, accessToken } = action.payload.data || action.payload;
if (user && accessToken) {
  // treat as "existing user, log in"
} else {
  // treat as "new user, go to details step"
}
```

This can never take the "log in" branch — the registration-verify endpoint it's reacting
to only ever returns `{ message }`, never `{ user, accessToken }`. It's unreachable code
as currently wired.

Once bug #3 is fixed, this check isn't needed at all: the two flows are already
distinguished by *which endpoint you called* (register-verify vs. login-verify), not by
inspecting the shape of the response.

---

### 5. "Delete account" calls a route that doesn't exist

**Files:** `src/store/slices/authSlice.js` (`deleteUserAccount` thunk, around line 90),
UI: `src/components/common/Popup/DeleteAccountPopup.jsx`

```js
const response = await api.delete("/user/delete");
```

This route does not exist on the backend, **by design**. Account deletion is
intentionally unsupported — an admin can lock/ban a user, but accounts are never hard-deleted,
to preserve order and audit history. This call will always fail.

**Fix:** remove this thunk and the delete-account popup/flow. If the product actually
needs a "deactivate my account" feature, that requires a new backend endpoint that
doesn't exist yet — raise it with backend before building any frontend UI for it.

---

### 6. Two competing, unsynchronized auth state stores

**Files:** `src/store/slices/authSlice.js` (Redux Toolkit) and `src/store/useAuthStore.js`
(Zustand)

Both independently track `user` / `isAuthenticated` / tokens, both read and write the
same `localStorage` keys (`hoh_token`, `hoh_user`), and both get called side-by-side in
`AuthPopup.jsx` — `dispatch(...)` for Redux, `zustandLogin(...)` for Zustand.

They can drift out of sync. Example: `logoutUser` (Redux) clears the Redux auth state but
never calls the Zustand store's `logout()` — so any component reading from
`useAuthStore` would still think the user is logged in after a Redux-driven logout.

**Fix:** pick one (Redux `authSlice` is more complete — it already has all the async
thunks) and delete the other. Migrate any component currently reading from
`useAuthStore` to read from `state.auth` instead.

---

## Not integrated — screens run entirely on mock data

### 7. Orders / Returns / Exchanges are 100% mock data

**Files:** `src/components/account/OrdersPanel/OrdersPanel.jsx`,
`ReturnItemView.jsx`, `SizeExchangeView.jsx` — all do
`import { mockOrders } from '../../../data/ordersData'`.

There is no `orderService.js` in `src/services/` at all. None of these screens reflect
real order data.

**Backend endpoints available (all tested, none currently called from the frontend):**

| Endpoint | Purpose |
|---|---|
| `GET /orders?page=&limit=&status=&startDate=&endDate=&search=` | Paginated order history. `status` is an `OrderStatus` enum; `startDate`/`endDate` are `YYYY-MM-DD`; `search` matches product title. |
| `GET /orders/:orderId` | Order detail |
| `PUT /orders/:orderId/cancel` | Body `{ reason?, comment? }` — both optional |
| `POST /orders/:orderId/return` | Body `{ orderItemId, reasonCategory, reasonDetail, comment? }`. Only allowed on **DELIVERED** orders, within a 7-day window from delivery. |
| `GET /orders/:orderId/return` | List return requests for that order |
| `POST /orders/:orderId/exchange` | Body `{ orderItemId, requestedSize, reasonCategory, reasonDetail }`. Same DELIVERED + 7-day rule. |
| `GET /orders/:orderId/exchange` | List exchange requests |
| `GET /orders/:orderId/track` | Tracking timeline — `{ orderId, orderStatus, estimatedDelivery, deliveredAt, timeline: [...] }` |
| `GET /orders/:orderId/invoice` | PDF download — response is binary `application/pdf`, not JSON |
| `POST /orders/:orderId/delivery-feedback` | Body `{ rating: 1-5, comment? }`. DELIVERED orders only, once per order. |

**Fix:** build `orderService.js` wrapping these calls, add a Redux slice following the
existing pattern (see `productSlice.js`/`cartSlice.js`), then point `OrdersPanel`,
`ReturnItemView`, and `SizeExchangeView` at real data instead of `mockOrders`.

---

### 8. No product review submission

No `reviewService.js` exists; nothing calls `POST /reviews/product/:productId`.

**Backend contract:** body `{ rating: 1-5, title?, body?, imageUrl?, imageKey? }`.
`imageUrl`/`imageKey` must be provided together or not at all (see bug #9 for how to get
them). Submitting a review **requires a verified purchase** — the backend returns
`403 REVIEW_NOT_PURCHASED` if the user never bought that product in a completed,
non-cancelled order.

Also available: `GET /reviews/product/:productId?page=&limit=` (public, no auth needed)
to list reviews; `PUT /reviews/:reviewId` / `DELETE /reviews/:reviewId` to edit/delete
your own review.

---

### 9. No review-photo upload wiring

Nothing calls `POST /upload/presign-review`.

**Backend contract:** body `{ contentType: "image/jpeg" | "image/png" | "image/webp", fileSize: <bytes, max 5MB> }`.
Response: `{ signedUrl, key, publicUrl }`.

**Flow:**
1. Call this endpoint to get `signedUrl`/`key`/`publicUrl`.
2. `PUT` the raw file bytes directly to `signedUrl` (this goes straight to Cloudflare R2,
   **not** through the HoH backend).
3. Submit the review (bug #8) with `imageUrl: publicUrl` and `imageKey: key`.

---

### 10. "Best Sellers" section isn't showing real best-sellers

**File:** `src/components/home/BestSellers/BestSellers.jsx`, via `fetchHomeProducts` in
`src/store/slices/productSlice.js`

Currently fetches products grouped by category (`GET /products/grouped-by-category`) and
shuffles them client-side (`shuffleArray`) — this has nothing to do with actual sales.

**There's a real endpoint for this:** `GET /products/best-selling?limit=10` — returns
products ranked by actual units sold (cancelled orders are excluded from the count), each
with a `unitsSold` field attached.

**Fix:** add `fetchBestSellingProducts` to `productService.js` / `productSlice.js`
calling this endpoint, and point `BestSellers.jsx` at it instead of the shuffle logic.

---

## Quick reference — what's actually fine

Don't waste time re-checking these; they were verified correct: `productService.js`,
`cartService.js`, `addressService.js`, `paymentService.js`, `categoryService.js`,
`faqService.js`, `contactService.js` all call the right paths with the right body shapes.
