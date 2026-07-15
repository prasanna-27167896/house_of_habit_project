# HoH Backend — Implementation Progress

## Project
- **Stack:** Express.js + TypeScript + PostgreSQL (Prisma ORM)
- **Platform:** Single-brand clothing e-commerce
- **Server port:** 3006
- **Database:** `hohdb` on `localhost:5434` (Docker — postgres:16)
- **IDs:** All primary keys are `String @id @default(uuid())` (UUID v4)
- **TypeScript:** Strict mode — `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `NodeNext`

---

## Status Summary

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1 | Auth & Users | ✅ Complete | |
| 2 | Categories & Brands | ✅ Complete | |
| 3 | Products & Variants | ✅ Complete | |
| 4 | Wishlist | ✅ Complete | |
| 5 | Cart | ✅ Complete | |
| 6 | Addresses | ✅ Complete | |
| 7 | Coupons | ✅ Complete | |
| 8 | Orders | ✅ Complete | |
| 9 | Payments (Razorpay) | ✅ Complete | 3-layer verify + webhook + COD |
| 10 | Ratings, Reviews & Replies | ✅ Complete | |
| 11 | Returns & Refunds | ⏭ Deferred | Manual refunds via Razorpay dashboard for now |
| 12 | Admin Notifications | ⏭ Deferred | Requires WebSockets (Socket.io) |
| 13 | Feedback & Contact | ✅ Complete | |
| 14 | FAQs & Store Info | ✅ Complete | |
| — | Admin Setup Status | ✅ Complete | `GET /api/v1/admin/setup-status` |
| — | Email (Resend) | ✅ Complete | Replaced nodemailer with Resend SDK + React templates |

**Completed: 12/14 modules** | **Deferred: 2** | **Nothing blocking launch**

---

## Completed Modules

---

### ✅ Module 1 — Auth & Users
**Migration:** `20260630054817_module1_auth_users`

**Tables:** `users`, `roles`, `user_roles`, `refresh_tokens`, `email_verifications`, `forgot_passwords`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/sendVerificationOtp?email=` | Public |
| POST | `/api/v1/auth/verifyOtp/:email` | Public |
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/refresh` | Public |
| POST | `/api/v1/auth/logout` | USER |
| POST | `/api/v1/forgotPassword/verifyMail` | Public |
| POST | `/api/v1/forgotPassword/verifyOtp/:email` | Public |
| POST | `/api/v1/forgotPassword/changePassword/:email` | Public |
| GET | `/api/v1/user/` | USER |
| PUT | `/api/v1/user/update` | USER |
| PUT | `/api/v1/user/change-password` | USER |
| GET | `/api/v1/admin/users` | ADMIN |
| POST | `/api/v1/admin/users/lock/:userId` | ADMIN |
| DELETE | `/api/v1/admin/users/:userId` | ADMIN |

**Key behaviours:**
- OTP expires in 10 minutes
- Account locks after 5 failed login attempts
- Password hashed with bcrypt + pepper (`PASSWORD_PEPPER`)
- Access token: 1h | Refresh token: 7 days
- Email via Resend SDK (OTP + forgot password templates)

---

### ✅ Module 2 — Categories & Brands
**Migrations:** `20260630063806_module2_categories_brands`, `20260630065230_add_image_key_to_categories_brands`

**Tables:** `categories`, `brands`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/categories/add` | ADMIN |
| PUT | `/api/v1/categories/:categoryId` | ADMIN |
| DELETE | `/api/v1/categories/:categoryTitle` | ADMIN |
| PATCH | `/api/v1/categories/:categoryId?status=true\|false` | ADMIN |
| GET | `/api/v1/categories` | Public |
| GET | `/api/v1/categories/:categoryId` | Public |
| POST | `/api/v1/brands/add` | ADMIN |
| PUT | `/api/v1/brands/update/:brandId` | ADMIN |
| DELETE | `/api/v1/brands/delete/:brandId` | ADMIN |
| GET | `/api/v1/brands` | Public |
| GET | `/api/v1/brands/category/:categoryId` | Public |
| GET | `/api/v1/brands/:brandId` | Public |

---

### ✅ Module 3 — Products & Variants
**Migration:** `20260630070550_module3_products_variants`

**Tables:** `products`, `product_variants`
**Enums:** `Gender`, `FitType`, `Season`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/products/add` | ADMIN |
| PUT | `/api/v1/products/:productId` | ADMIN |
| DELETE | `/api/v1/products/:productId` | ADMIN |
| PATCH | `/api/v1/products/toggle/:productId` | ADMIN |
| GET | `/api/v1/products` | Public |
| GET | `/api/v1/products/all` | Public |
| GET | `/api/v1/products/grouped-by-category` | Public |
| GET | `/api/v1/products/search` | Public |
| GET | `/api/v1/products/category/:categoryId` | Public |
| GET | `/api/v1/products/:productId` | Public |
| POST | `/api/v1/products/:productId/variants` | ADMIN |
| PUT | `/api/v1/products/:productId/variants/:variantId` | ADMIN |
| DELETE | `/api/v1/products/:productId/variants/:variantId` | ADMIN |

---

### ✅ Module 4 — Wishlist
**Migration:** `20260630071459_module4_wishlist`

**Tables:** `wishlists` (composite PK: userId + productId)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/wishlist/:productId` | USER |
| DELETE | `/api/v1/wishlist/:productId` | USER |
| GET | `/api/v1/wishlist` | USER |
| GET | `/api/v1/wishlist/check/:productId` | USER |

---

### ✅ Module 5 — Cart
**Migration:** `20260630071700_module5_cart`

**Tables:** `carts`, `cart_items` (unique pair: cartId + variantId)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/cart` | USER |
| POST | `/api/v1/cart` | USER |
| PUT | `/api/v1/cart/items/:cartItemId` | USER |
| DELETE | `/api/v1/cart/items/:cartItemId` | USER |
| DELETE | `/api/v1/cart` | USER |

---

### ✅ Module 6 — Addresses
**Migration:** `20260630090633_module6_addresses`

**Tables:** `addresses`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/addresses` | USER |
| GET | `/api/v1/addresses/:addressId` | USER |
| POST | `/api/v1/addresses` | USER |
| PUT | `/api/v1/addresses/:addressId` | USER |
| DELETE | `/api/v1/addresses/:addressId` | USER |
| PATCH | `/api/v1/addresses/:addressId/default` | USER |

**Key behaviours:**
- Max 5 addresses per user
- Duplicate address check (case-insensitive on addressLine1 + pincode)
- Setting default unsets all others in a transaction

---

### ✅ Module 7 — Coupons
**Migration:** `20260630093024_module7_coupons`

**Tables:** `coupons`
**Enums:** `CouponScope` (CART, CATEGORY, PRODUCT), `CouponType` (PERCENTAGE, FLAT)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/coupons` | Public |
| GET | `/api/v1/coupons/validate/:code` | USER |
| POST | `/api/v1/coupons` | ADMIN |
| PUT | `/api/v1/coupons/:couponId` | ADMIN |
| DELETE | `/api/v1/coupons/:couponCode` | ADMIN |
| GET | `/api/v1/coupons/admin/all` | ADMIN |

---

### ✅ Module 8 — Orders
**Migration:** `20260630100503_add_orders`

**Tables:** `orders`, `order_items`
**Enums:** `OrderStatus` (11 values), `PaymentStatus` (5 values)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/orders` | USER |
| POST | `/api/v1/orders/single/:cartItemId` | USER |
| GET | `/api/v1/orders` | USER |
| GET | `/api/v1/orders/:orderId` | USER |
| PUT | `/api/v1/orders/:orderId/cancel` | USER |
| PUT | `/api/v1/orders/:orderId/upload-proof` | USER |
| GET | `/api/v1/orders/admin` | ADMIN |
| GET | `/api/v1/orders/admin/all` | ADMIN |
| GET | `/api/v1/orders/admin/stats` | ADMIN |
| GET | `/api/v1/orders/admin/monthly-counts` | ADMIN |
| GET | `/api/v1/orders/admin/status/:status` | ADMIN |
| GET | `/api/v1/orders/admin/user/:userId` | ADMIN |
| GET | `/api/v1/orders/admin/:orderId` | ADMIN |
| PUT | `/api/v1/orders/admin/:orderId/status` | ADMIN |
| PUT | `/api/v1/orders/admin/:orderId/payment-status` | ADMIN |
| DELETE | `/api/v1/orders/admin/:orderId` | ADMIN |

---

### ✅ Module 9 — Payments (Razorpay)

**Tables:** `payments` (audit trail — multiple rows per order)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/payment/initiate` | USER |
| POST | `/api/v1/payment/initiate/single/:cartItemId` | USER |
| POST | `/api/v1/payment/verify` | USER |
| POST | `/api/v1/payment/cod` | USER |
| POST | `/api/v1/payment/cod/single/:cartItemId` | USER |
| GET | `/api/v1/payment/status/:orderId` | USER |
| POST | `/api/v1/payment/webhook` | Public (Razorpay) |

**Key behaviours:**
- Razorpay Order-based flow (not Payment Links)
- 3-layer verify: HMAC signature → server-to-server fetch → confirm transaction
- `keyId` sent from backend on initiate — frontend never stores it
- Webhook uses separate `RAZORPAY_WEBHOOK_SECRET`
- Webhook always returns 200; processes after response to avoid timeouts
- `payment.captured` guard: already COMPLETED → audit only; amount mismatch → FRAUD_AMOUNT_MISMATCH audit
- `payment.failed` on terminal order → audit only; on PROCESSING → `failPendingPayment`
- Frontend verify on already-COMPLETED order → returns CONFIRMED (webhook beat it — still success)
- Payment audit trail: source values `FRONTEND_VERIFY | WEBHOOK | COD | FETCH_FAILED | FRAUD_AMOUNT_MISMATCH | FRAUD_ORDER_MISMATCH`
- Stock deducted ONLY on `confirmPaymentTransaction` — never at order creation (pending order pattern)
- Receipt max 40 chars — uses `orderId` directly (UUID = 36 chars)

---

### ✅ Module 10 — Ratings, Reviews & Replies

**Tables:** `reviews`, `review_replies`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/reviews/:productId` | USER |
| PUT | `/api/v1/reviews/:reviewId` | USER |
| DELETE | `/api/v1/reviews/:reviewId` | USER |
| GET | `/api/v1/reviews/:productId` | Public |
| POST | `/api/v1/reviews/:reviewId/reply` | ADMIN |
| PUT | `/api/v1/reviews/:reviewId/reply` | ADMIN |
| DELETE | `/api/v1/reviews/:reviewId/reply` | ADMIN |
| DELETE | `/api/v1/reviews/admin/:reviewId` | ADMIN |

**Key behaviours:**
- One review per user per product
- `avgRating` + `numRatings` on Product auto-updated after every review change
- Admin reply triggers `sendReviewReplyEmail` to customer via Resend

---

### ✅ Module 13 — Feedback & Contact

**Tables:** `contacts`

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/contact` | Public |
| GET | `/api/v1/contact/admin` | ADMIN |
| GET | `/api/v1/contact/admin/:contactId` | ADMIN |
| PATCH | `/api/v1/contact/admin/:contactId/status` | ADMIN |
| POST | `/api/v1/contact/admin/:contactId/reply` | ADMIN |

**Key behaviours:**
- Admin reply triggers `sendContactReplyEmail` to submitter via Resend

---

### ✅ Module 14 — FAQs & Store Info

**Tables:** `faqs`, `store_info` (singleton)

**Endpoints:**

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/faqs` | Public |
| POST | `/api/v1/faqs` | ADMIN |
| PUT | `/api/v1/faqs/:faqId` | ADMIN |
| DELETE | `/api/v1/faqs/:faqId` | ADMIN |
| GET | `/api/v1/store-info` | Public |
| PUT | `/api/v1/store-info` | ADMIN |

**Key behaviours:**
- StoreInfo is a singleton (upsert pattern)
- `shippingCharge` and `freeShippingAbove` read by payment service at order time
- Missing StoreInfo → shipping charge defaults to 0

---

### ✅ Admin Setup Status

**Endpoint:** `GET /api/v1/admin/setup-status` (ADMIN)

Checks:
- StoreInfo missing (critical)
- shippingCharge = 0 with no freeShippingAbove (warning)
- Store email/phone missing (warning)
- No active categories (critical)
- No active products (critical)
- No variants with stock > 0 (critical)

Returns: `{ isReady, criticalCount, warningCount, warnings[] }`

---

### ✅ Email — Resend SDK

**Replaced:** nodemailer (removed)
**Package:** `resend` + `react` + `@types/react`

**Templates** (`src/emails/`):
- `OtpEmail.tsx` — email verification OTP
- `ForgotPasswordEmail.tsx` — password reset OTP
- `ContactReplyEmail.tsx` — admin reply to contact form
- `ReviewReplyEmail.tsx` — admin reply to product review

**Config:**
```env
RESEND_API_KEY=re_xxxx          # from resend.com dashboard
RESEND_FROM=HoH <noreply@yourdomain.com>
```
If `RESEND_API_KEY` is not set, emails are logged to console (dev-safe).

---

## Infrastructure

| Item | Status |
|------|--------|
| Prisma ORM + PostgreSQL | ✅ |
| UUID string IDs (all tables) | ✅ |
| Cloudflare R2 image upload (presign flow) | ✅ |
| JWT auth middleware | ✅ |
| Role-based access middleware | ✅ |
| Global error handler + AppError class | ✅ |
| Zod v4 validation | ✅ |
| Repository pattern (no Prisma calls outside repos) | ✅ |
| Interface layer (no generated types outside interfaces) | ✅ |
| Resend email (React templates) | ✅ |
| `tsc --noEmit` — zero errors | ✅ |

---

## Deferred (Not Blocking Launch)

| Module | Reason | Workaround |
|--------|--------|------------|
| Returns & Refunds | Low volume — manual refund via Razorpay dashboard | Admin triggers refund from Razorpay dashboard directly |
| Admin Notifications | Requires WebSocket infrastructure (Socket.io) | Admin polls order list manually |

---

## Pending Setup (Pre-Launch Checklist)

- [ ] Add `RESEND_API_KEY` and `RESEND_FROM` to `.env` (get from resend.com)
- [ ] Add real `RAZORPAY_WEBHOOK_SECRET` to `.env` after registering webhook URL in Razorpay Dashboard → Settings → Webhooks
- [ ] Webhook URL: `https://<your-domain>/api/v1/payment/webhook`
- [ ] Webhook events to enable: `payment.captured`, `payment.failed`
- [ ] Set `StoreInfo` via `PUT /api/v1/store-info` before launch (shipping charge, store details)
- [ ] Seed at least one active category and product before going live
