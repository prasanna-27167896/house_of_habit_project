# HoH — Frontend ↔ Backend Integration Guide

> **Audience:** the frontend developer building HohFE.
> **Purpose:** build the frontend **against the real backend contract** — not against
> assumed/guessed endpoints. Everything below is taken directly from the running
> backend code. If anything here disagrees with what you assumed, **this document
> and the live Swagger docs win.**

---

## 0. Read this first — non-negotiable rules

1. **No mock data in shipped screens.** Every screen must pull from the real API.
   The current `src/data/*.js` files are placeholders and must be removed as each
   feature is wired.
2. **Test every call against the running backend** (`http://localhost:3006`) before
   marking it done. Do **not** code to an imagined API shape. The last integration
   attempt called endpoints that do not exist (`/auth/send-otp`, `/auth/onboard`) —
   that must not happen again.
3. **The source of truth for exact request/response fields is the live Swagger UI:**
   - Swagger UI: `http://localhost:3006/api/docs`
   - Raw OpenAPI JSON: `http://localhost:3006/api/docs.json`
   This document explains the *contract and the flows*; Swagger has the *per-field detail*.
4. **No `console.log` / debug code** in committed frontend code.
5. **Definition of done for any API feature:** wired to real endpoint → loading state →
   error state (shows backend `message`) → empty state → verified against `:3006` with
   a short screen recording.

---

## 1. Environment & base URL

| | Value |
|---|---|
| Backend base URL (dev) | `http://localhost:3006/api/v1` |
| API version prefix | `/api/v1` (always) |
| Health check | `GET http://localhost:3006/health` |
| Swagger UI | `http://localhost:3006/api/docs` |
| Allowed frontend origin (dev) | `http://localhost:5173` (Vite default) — set by backend `CLIENT_ORIGIN` |

**Frontend `.env` (create this):**
```
VITE_API_URL=http://localhost:3006/api/v1
```

**axios instance must use it and send credentials (for the refresh cookie):**
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // NOT localhost:4000/api
  withCredentials: true,                 // required — refresh_token is an httpOnly cookie
  headers: { "Content-Type": "application/json" },
});
```

> **CORS:** the backend only accepts requests from the origins in `CLIENT_ORIGIN`
> (comma-separated). If you deploy the frontend elsewhere, that origin must be added
> to the backend env — ask the backend owner.

---

## 2. Response envelope — EVERY response follows this shape

**Success:**
```json
{ "success": true, "data": { /* ...payload... */ } }
```
Always read your payload from `response.data.data`.

**Error:**
```json
{ "success": false, "message": "Human-readable message", "code": "ERROR_CODE" }
```
Validation errors additionally include a per-field map:
```json
{
  "success": false,
  "message": "Password must be at least 8 characters",
  "code": "VALIDATION_ERROR",
  "errors": { "password": "Password must be at least 8 characters" }
}
```

**Frontend rules:**
- Show `error.response.data.message` in toasts (it is always human-readable).
- For form errors, use `error.response.data.errors` to highlight the offending fields.

### Error codes you will see

| HTTP | `code` | Meaning / what the frontend should do |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Show field errors from `errors` map |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | Not logged in → open auth popup |
| 401 | `ACCESS_TOKEN_EXPIRED` | Call `/auth/refresh`, then retry the request once (see §3) |
| 403 | (role) | Logged in but not allowed (admin-only route) |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate (e.g. email already registered) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests — back off, show "try again later" |
| 500 | `INTERNAL_SERVER_ERROR` | Generic failure |

---

## 3. Authentication & session model  ⚠️ READ CAREFULLY

**The app uses EMAIL + PASSWORD authentication.** There is **no passwordless
"OTP login".** OTP is used only for:
- verifying the email address **during registration**, and
- **forgot-password**.

### Tokens
- On **register** and **login**, the backend returns in the body:
  ```json
  { "success": true, "data": { "user": { ... }, "accessToken": "<JWT>" } }
  ```
- It also sets an **httpOnly `refresh_token` cookie** automatically (you cannot and
  should not read it from JS — the browser stores/sends it).
- The **access token lasts 1 hour** and must be sent on every authenticated request:
  ```
  Authorization: Bearer <accessToken>
  ```

### What the frontend must implement
1. **Store the access token** (memory + optionally `localStorage` so a refresh survives).
   The current `useAuthStore` stores neither the token nor persists — fix this.
2. **Request interceptor:** attach `Authorization: Bearer <accessToken>` when present.
3. **Response interceptor:** on `401` with code `ACCESS_TOKEN_EXPIRED`:
   - call `POST /auth/refresh` (no body needed — it reads the cookie),
   - store the new `accessToken`,
   - retry the original request once.
   If refresh fails → log out and open the auth popup.

### Registration flow (correct sequence)
| Step | Endpoint | Body / params | Notes |
|---|---|---|---|
| 1. Send OTP | `POST /auth/sendVerificationOtp` | `{ "email": "..." }` | 409 if email already registered |
| 2. Verify OTP | `POST /auth/verifyOtp/:email` | `{ "otp": 123456 }` | **`otp` is a NUMBER (6 digits), not a string** |
| 3. Create account | `POST /auth/register` | `{ "fullName", "email", "password", "mobile"? }` | Returns `user` + `accessToken`, sets refresh cookie. Password: min 8, ≥1 uppercase, ≥1 number. `mobile`: 10-digit Indian |

### Login flow
| Endpoint | Body | Returns |
|---|---|---|
| `POST /auth/login` | `{ "email", "password" }` | `user` + `accessToken` (+ refresh cookie) |

### Session endpoints
| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /auth/refresh` | cookie only | Rotate tokens, get new `accessToken` |
| `POST /auth/logout` | Bearer | Revoke session, clears cookie |

### Forgot password flow
| Step | Endpoint | Body |
|---|---|---|
| 1 | `POST /forgotPassword/verifyMail` | `{ "email" }` (always 200 — anti-enumeration) |
| 2 | `POST /forgotPassword/verifyOtp/:email` | `{ "otp": 123456 }` |
| 3 | `POST /forgotPassword/changePassword/:email` | `{ "otp": 123456, "newPassword" }` (revokes all sessions) |

> **Action for the current frontend:** the existing OTP-login popup
> (`/auth/send-otp`, `/auth/verify-otp`, `/auth/onboard`) is **wrong on every endpoint**
> and assumes a login model that does not exist. Rebuild it as: **Login = email+password**,
> **Register = the 3-step OTP flow above.**

---

## 4. Enums — use these exact values (do not invent your own)

**Order status** (`orderStatus`):
```
PENDING, ORDER_PLACED, CONFIRMED, PROCESSING, SHIPPED,
IN_TRANSIT, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, RETURN_REJECTED
```
**Payment status** (`paymentStatus`):
```
PENDING, PROCESSING, COD_PENDING, COMPLETED, FAILED, CANCELLED
```
**Address type:** `HOME`, `WORK`, `OTHER`
**Roles:** `ROLE_USER`, `ROLE_ADMIN`

> The current `ordersData.js` uses invented statuses like `out-for-pickup` and
> `refund-credited`. Map the UI to the **real** enum values above (you may keep a
> display-label lookup, but the source values must match the backend).

---

## 5. Pagination

List endpoints accept query params and default sensibly:
```
?page=1&limit=10          (orders: max limit 100)
?page=1&limit=20          (reviews, feedback, contacts)
```
Read pagination info from the returned `data` object (see Swagger for the exact
`items` / `pagination` shape per endpoint).

---

## 6. Endpoint reference (grouped)

Auth column: **Public** = no token · **User** = `Authorization: Bearer` required ·
**Admin** = Bearer + `ROLE_ADMIN`.
For exact request/response bodies, open the matching entry in `/api/docs`.

### Products  `/products`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/products` | Public | List products |
| GET | `/products/all` | Public | List all |
| GET | `/products/grouped-by-category` | Public | Products grouped by category (home page) |
| GET | `/products/search?q=` | Public | Search |
| GET | `/products/category/:categoryId` | Public | By category |
| GET | `/products/:productId` | Public | Product detail (includes variants) |
| POST/PUT/DELETE/PATCH `/products...` | Admin | (admin CRUD + variants) |

> Products have **variants** (`variantId`). Product detail returns variants; the PDP
> must let the user pick a variant, and the cart uses that `variantId`.

### Categories `/categories` & Brands `/brands`
| Method | Path | Auth |
|---|---|---|
| GET | `/categories` | Public |
| GET | `/categories/:categoryId` | Public |
| GET | `/brands` | Public |
| GET | `/brands/category/:categoryId` | Public |
| GET | `/brands/:brandId` | Public |
| (admin CRUD) | … | Admin |

### Cart `/cart`  — **all require User auth**
| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/cart` | — | Get cart |
| POST | `/cart` | `{ "variantId": "<uuid>", "quantity": 1 }` | Add item |
| PUT | `/cart/items/:cartItemId` | `{ "quantity": n }` | Update qty |
| DELETE | `/cart/items/:cartItemId` | — | Remove item |
| DELETE | `/cart` | — | Clear cart |

### Wishlist `/wishlist` — **User auth**
| Method | Path |
|---|---|
| GET | `/wishlist` |
| GET | `/wishlist/check/:productId` |
| POST | `/wishlist/:productId` |
| DELETE | `/wishlist/:productId` |

### Addresses `/addresses` — **User auth**
| Method | Path | Body |
|---|---|---|
| GET | `/addresses` | — |
| POST | `/addresses` | `{ fullName, phone(10 digits), addressLine1, addressLine2?, city, state, pincode(6 digits), country?, addressType?, isDefault? }` |
| GET | `/addresses/:addressId` | — |
| PUT | `/addresses/:addressId` | partial of above |
| DELETE | `/addresses/:addressId` | — |
| PATCH | `/addresses/:addressId/default` | — (set default) |

### Orders `/orders` — **User auth**
| Method | Path | Purpose |
|---|---|---|
| GET | `/orders?page=&limit=` | User's orders |
| GET | `/orders/:orderId` | Order detail |
| PUT | `/orders/:orderId/cancel` | Cancel order |
| `/orders/admin/...` | Admin | Order management, stats |

### Payment `/payment` — **User auth** (see §7 for the flow)
| Method | Path | Body |
|---|---|---|
| POST | `/payment/initiate` | `{ addressId?, couponCode? }` |
| POST | `/payment/initiate/single/:cartItemId` | `{ addressId?, couponCode? }` (buy-now) |
| POST | `/payment/verify` | `{ orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature }` |
| POST | `/payment/cod` | `{ addressId?, couponCode? }` (Cash on Delivery) |
| POST | `/payment/cod/single/:cartItemId` | COD buy-now |
| GET | `/payment/status/:orderId` | Poll payment status |

### Coupons `/coupons`
| Method | Path | Auth |
|---|---|---|
| GET | `/coupons/:couponCode` | Public (validate a code) |
| (CRUD) | `/coupons` | Admin |

### Reviews `/reviews`
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/reviews/product/:productId?page=&limit=` | Public | — |
| POST | `/reviews/product/:productId` | User | `{ rating(1-5), title?, body? }` |
| PUT | `/reviews/:reviewId` | User | partial |
| DELETE | `/reviews/:reviewId` | User | — |
| (admin replies/moderation) | `/reviews/admin/...` | Admin | |

### Contact / Feedback / FAQ / Store info
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/contact` | Public | `{ name, email, phone?, subject, message, website? }` (`website` = honeypot, leave empty) |
| POST | `/feedback` | Public | `{ name, email?, rating(1-5), category?, message, website? }` |
| GET | `/faqs` | Public | active FAQs |
| GET | `/store-info` | Public | store details |
| (admin management) | `/contact/admin/...`, `/faqs/...`, `/feedback/admin/...` | Admin | |

### User profile `/user` — **User auth**
| Method | Path | Body |
|---|---|---|
| GET | `/user` | — (get profile) |
| PUT | `/user/update` | `{ fullName?, mobile?, dateOfBirth? (YYYY-MM-DD) }` |
| PUT | `/user/change-password` | `{ currentPassword, newPassword }` |

### Uploads `/upload` (Admin only)
| POST | `/upload/presign` | Admin | Returns a presigned URL for direct upload |

---

## 7. Payment (Razorpay) — the money path

**This is the highest-risk feature. Build it carefully and demonstrate it end-to-end
against the real backend. Never mock it.**

**Prepaid flow:**
1. User has items in cart + a selected address.
2. `POST /payment/initiate` with `{ addressId, couponCode? }`.
   → Backend creates a pending order + a Razorpay order and returns the Razorpay
   order details (order id, amount, currency, Razorpay key id — confirm exact field
   names in `/api/docs`).
3. Open the **Razorpay Checkout** widget on the frontend with those details.
4. On success, Razorpay hands you `razorpay_payment_id`, `razorpay_order_id`,
   `razorpay_signature`.
5. `POST /payment/verify` with
   `{ orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature }`.
   → Backend verifies the signature and marks the order paid. **Only trust this
   response** — never mark an order paid on the client.
6. Show success/failure based on the verify response; optionally poll
   `GET /payment/status/:orderId`.

**Notes:**
- There is also a server-side Razorpay **webhook** (`/payment/webhook`) — that is
  backend-only, you do not call it.
- **COD:** skip Razorpay entirely, call `POST /payment/cod` (or `/cod/single/:cartItemId`).
- **Buy-now (single item):** use the `/single/:cartItemId` variants.
- Amounts/signatures are validated server-side; never compute or trust totals on the client.

---

## 8. Rate limiting

The backend rate-limits by IP (per 15-min window). On `429` (`RATE_LIMIT_EXCEEDED`),
back off and show a friendly "please try again later" message. Do not auto-retry in a
tight loop. Auth endpoints are the most restricted.

---

## 9. Frontend integration checklist (acceptance criteria)

- [ ] `.env` set to `http://localhost:3006/api/v1`; axios uses it + `withCredentials`.
- [ ] Auth rebuilt: **email+password login** and **3-step OTP registration** (correct endpoints).
- [ ] Access token stored, attached as `Bearer`, auto-refreshed on `ACCESS_TOKEN_EXPIRED`.
- [ ] Session persists across page refresh; logout clears it and calls `/auth/logout`.
- [ ] Protected routes (`/account`, orders, checkout) guarded — redirect/prompt if not authed.
- [ ] Products, categories, brands, product detail (with variants) from real API.
- [ ] Cart uses `variantId`; add/update/remove/clear wired.
- [ ] Wishlist, addresses, orders, order detail, cancel — all real API.
- [ ] Order/payment statuses use the **real enum values** (§4).
- [ ] Reviews (list + create) wired.
- [ ] Contact/feedback forms POST to real endpoints (honeypot `website` left empty).
- [ ] **Payment: full Razorpay initiate → checkout → verify flow works against `:3006`** — demonstrated on video. COD path works too.
- [ ] Every call handles loading / error (shows backend `message`) / empty states.
- [ ] All `src/data/*.js` mock files removed once their feature is wired.
- [ ] No `console.log` / debug code committed.

---

## 10. Recommended (strongly)

- **Adopt TypeScript**, at minimum for API response types and the payment module —
  it turns "wrong response shape" bugs (exactly the class that caused the earlier
  broken auth integration) into compile-time errors instead of runtime failures in
  front of customers.
- Keep the API layer in one place (`src/api/*`) rather than calling `axios` inside
  components, so response shapes are defined once.
</content>
</invoke>
