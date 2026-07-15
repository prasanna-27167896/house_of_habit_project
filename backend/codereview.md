# HoH Backend — Code Review

**Reviewer:** Claude (Opus 4.8)
**Date:** 2026-07-02
**Scope:** Full backend (`src/`) reviewed module-by-module across every layer — routes, controllers, services, repositories, validators, errors, interfaces, plus shared infrastructure.
**Method:** Each module read in isolation (no mixing). Findings below are grouped: cross-cutting issues first, then one section per module.

> This is an analysis document. **No code was changed.** Each finding lists the location, the problem, the impact, and the recommended fix.

---

## Severity legend

| Level | Meaning |
|-------|---------|
| 🔴 **CRITICAL** | Breaks a core flow or exposes a serious exploit. Fix before launch. |
| 🟠 **HIGH** | Real bug or security/data-integrity risk. Fix soon. |
| 🟡 **MEDIUM** | Correctness gap, race condition, or maintainability problem. Plan to fix. |
| 🔵 **LOW** | Minor / cosmetic / defense-in-depth. Fix when convenient. |

---

## Executive summary — prioritized fix list

1. 🔴 **Validation errors return HTTP 500 instead of 400** — no `ZodError` branch in the error middleware, but every controller uses `.parse()`. *(C1)*
2. 🟠 **Stock oversell under concurrency** — stock is decremented with `{ decrement }` and no conditional guard; two concurrent orders for the last unit both succeed. *(C2)*
3. 🟠 **Unpaid orders via the legacy `POST /orders` path** — it creates an order, deducts stock, and clears the cart with no payment step, running parallel to the payment module. *(O1)*
4. 🟠 **`DELETE /admin/users/:userId` hard-deletes a user** — breaks order history FK, no self/other-admin guard. *(U1)*
5. 🟡 **User enumeration** on auth endpoints (register / forgot-password / login). *(A1)*
6. 🟡 **Coupon usage limit is not atomic** — can be exceeded under concurrency; no per-user cap; `registeredOnly` never enforced. *(CP1, CP2)*
7. 🟡 **Admin order-status changes have no state machine** — cancelling via status update doesn't restore stock; any transition allowed. *(O3)*
8. 🟡 **`numRatings` actually stores the average rating, not a count** — misleading field; the "popular" sort is sorting by average, not popularity. *(R2)*
9. 🟡 **Payment audit trail has no read endpoint** — all that audit data is write-only; admins can't see it. *(PM1)*
10. 🟡 **`zod` vs `zod/v4` import inconsistency**, **OTP uses `Math.random()`**, **missing rate limiters on `/user` & `/admin/users`**. *(C3, C4, C5)*

---

# Cross-cutting / shared infrastructure

### 🔴 C1 — Zod validation failures return 500, not 400 — ✅ FIXED (2026-07-03)
**Fix applied:** Added a `ZodError` branch to `error.middleware.ts` returning `400 { code: "VALIDATION_ERROR", errors: { field: message } }`. Verified at runtime. Depended on C3 (below), which was fixed first.

**Location:** `src/middleware/error.middleware.ts` + every `src/controllers/*.ts`
Every controller validates with `schema.parse(req.body)` (e.g. `auth.controller.ts:30`, `address.controller.ts:19`). `parse()` throws a `ZodError` on bad input. The error middleware only handles `AppError` and Prisma errors — a `ZodError` is neither, so it falls through to the generic handler:
```ts
res.status(500).json({ ... message: env.NODE_ENV === "production" ? "Internal server error." : error.message ... })
```
**Impact:** All invalid input → HTTP 500 with either a giant stringified Zod error (dev) or an opaque "Internal server error" (prod). Clients get no usable field-level feedback, and monitoring is polluted with fake 500s.
**Fix:** Add a `ZodError` branch at the top of the middleware:
```ts
import { ZodError } from "zod";
if (err instanceof ZodError) {
  res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Invalid request data.", errors: err.flatten().fieldErrors });
  return;
}
```
⚠️ Note the interaction with **C3**: because two schemas import `zod/v4` and the rest import `zod`, a single `instanceof ZodError` check may not catch both. Unify the import first.

### 🟠 C2 — Stock oversell under concurrency — ✅ FIXED (2026-07-03)
**Fix applied:** Introduced an atomic guarded decrement (`reservation.repo.ts:decrementStock` — `updateMany WHERE stock >= qty`) used everywhere stock drops, so a losing race throws `OUT_OF_STOCK` and rolls back. Went further and built a full **inventory-reservation system**: `POST /payment/initiate` now reserves stock for a 15-min window (`InventoryReservation` table, ACTIVE→CONSUMED on payment / →RELEASED on fail/expiry), a pg-boss cron sweeps abandoned holds every 15 min and returns stock, and COD deducts atomically at placement. Reserve/consume/release/sweep/out-of-stock all runtime-verified. See below for original detail.

**Location:** `src/repositories/order.repo.ts` (`createOrderWithItems`, `confirmPaymentTransaction`)
Stock is deducted with:
```ts
await tx.productVariant.update({ where: { variantId }, data: { stock: { decrement: item.quantity } } });
```
Availability is validated earlier (`validateItemAvailability`) but the decrement itself has no guard. Two concurrent checkouts for the last unit both pass validation and both decrement → **negative stock / oversell**.
**Fix:** Make the decrement conditional and detect the miss, e.g.:
```ts
const res = await tx.productVariant.updateMany({
  where: { variantId, stock: { gte: item.quantity } },
  data: { stock: { decrement: item.quantity } },
});
if (res.count === 0) throw Errors.OUT_OF_STOCK(...);
```
This runs inside the existing transaction, so the whole order rolls back on a losing race.

### 🟡 C3 — `zod` vs `zod/v4` import inconsistency — ✅ FIXED (2026-07-03)
**Fix applied:** `order.schema.ts` and `coupon.schema.ts` now import from `"zod"` like the other 12. All schemas throw the same `ZodError` class, so the C1 `instanceof ZodError` check is reliable. Typecheck clean.

**Location:** `src/validators/order.schema.ts:1` and `src/validators/coupon.schema.ts:1` import `from "zod/v4"`; the other 12 validators import `from "zod"`.
**Impact:** Two different Zod module instances/APIs in one app. `instanceof ZodError` checks won't cross instances (directly relevant to the C1 fix), and behavior can subtly differ.
**Fix:** Standardize on one import path across all validators.

### 🟡 C4 — OTP generated with `Math.random()` — ✅ FIXED (2026-07-03)
**Fix applied:** `generateOtp` now uses `crypto.randomInt(100000, 1000000)` (OS CSPRNG) instead of `Math.random()`. Range verified (100000–999999 inclusive), typecheck clean.

**Location:** `src/utils/otp.ts:1-2`
```ts
export const generateOtp = (): number => Math.floor(100000 + Math.random() * 900000);
```
`Math.random()` is not cryptographically secure — OTP values are predictable.
**Fix:** `import { randomInt } from "node:crypto"; return randomInt(100000, 1000000);`

### 🟡 C5 — Missing rate limiters on `/user` and `/admin/users` — ✅ FIXED (2026-07-03)
**Fix applied:** Both mounts now use `adaptiveLimiter` (read limit for GET, write limit for mutations), matching every other route group. Typecheck clean.

**Location:** `src/app.ts:106-107`
Every route group gets a limiter except:
```ts
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin/users", adminUserRouter);
```
**Fix:** Add `adaptiveLimiter` (or `writeLimiter`) to both.

### 🔵 C6 — Duplicated business logic between order & payment services — ✅ FIXED (2026-07-03)
**Fix applied:** Extracted the five shared helpers (`validateItemAvailability`, `calcTotals`, `calcCouponDiscount`, `buildOrderItems`, `resolveShippingCharge`) into `src/services/order.helpers.ts`; both services now import them. Reconciled the drifted `buildOrderItems` (`imageUrl ?? null`). Removed the now-unused `faqRepo`/`CouponWithRelations` imports. Typecheck clean.

**Location:** `src/services/order.service.ts` and `src/services/payment.service.ts`
`calcTotals`, `calcCouponDiscount`, `buildOrderItems`, `resolveShippingCharge`, `validateItemAvailability` are copy-pasted in both. They already drift slightly (e.g. `buildOrderItems` imageUrl handling differs).
**Fix:** Extract into a shared `order.helpers.ts` and import in both.

### 🔵 C7 — `sendError` envelope omits `code` — ✅ FIXED (2026-07-03)
**Fix applied:** `sendError` was dead code (defined, never called — verified by grep). Removed it entirely so the only error path is the middleware's `{ success, message, code }`; added a comment noting error bodies are produced centrally. Typecheck clean.

**Location:** `src/utils/response.ts:7-9` returns `{ success, message }` while the error middleware always returns `{ success, message, code }`. Inconsistent client contract. (Currently `sendError` appears unused — either remove it or align it.)

---

# Module 1 — Auth

### 🟡 A1 — User enumeration — ✅ FIXED (2026-07-03)
**Fix applied:**
- **Login timing** — `login` spends a dummy bcrypt compare on unknown emails (done in the auth rework), and the `user.locked` check now runs **after** password verification, so lock state only leaks to someone who already has the correct password.
- **Forgot-password** — `sendForgotPasswordOtpService` returns silently for unknown emails and the controller responds with a generic *"If an account with that email exists…"* message. Verified: no row leaked for unknown emails.
- **Signup** (`EMAIL_ALREADY_REGISTERED`) — **intentionally kept.** Telling a user their email is already registered at signup is standard UX (Google/most sites do it) and low-risk; hiding it degrades the signup flow.

**Location:** `src/services/auth.service.ts`
- `sendVerificationOtp` (l.31) → `EMAIL_ALREADY_REGISTERED` reveals an email is registered.
- `sendForgotPasswordOtpService` (l.112) → `ACCOUNT_NOT_FOUND` reveals an email is **not** registered.
- `login` (l.70) checks `if (user.locked)` before verifying the password, revealing lock state.
**Impact:** Lets an attacker enumerate which emails have accounts.
**Fix:** For forgot-password, respond with a generic success regardless of existence. Verify password before surfacing lock state, or use a single generic `INVALID_CREDENTIALS`.

### 🟡 A2 — No per-OTP attempt limit — ✅ FIXED (2026-07-03)
**Fix applied:** Added an `attempts` counter to `EmailVerification` and `ForgotPassword` (migration `otp_attempt_limit`). All three OTP-verify paths now bump the counter on a wrong guess and, at 5 failures, invalidate the OTP (`OTP_MAX_ATTEMPTS`, 429). Requesting a fresh OTP resets the counter. Verified: 4× `OTP_INVALID` then `OTP_MAX_ATTEMPTS` + record deleted.

**Location:** `verifyRegistrationOtp` (l.38), `verifyForgotPasswordOtp` (l.119), `changePassword` (l.129)
A 6-digit OTP can be guessed with no per-record attempt counter/lockout. Only the global auth rate limiter (20/15min prod) slows it.
**Fix:** Track failed attempts per OTP record; invalidate after N (e.g. 5) failures.

### 🟡 A3 — Refresh tokens stored in plaintext; single active session — ✅ FIXED (2026-07-03, via session-backed auth rework)
**Fix applied:** The `RefreshToken` table was replaced by a `Session` table storing only the **SHA-256 hash** of the refresh token (`refreshHash`), keyed per-session → **multi-device** logins are independent. Includes refresh-token rotation + reuse detection. See `docs/auth_docs.md`.

**Location:** `src/repositories/auth.repo.ts` (`upsertRefreshToken`, `findRefreshToken` keyed by `userId`)
Raw JWTs are stored; DB compromise = usable tokens. Also the `userId`-unique row means logging in on a new device silently invalidates all other sessions.
**Fix:** Store a hash (e.g. SHA-256) of the refresh token; if multi-device is desired, key sessions by token id rather than userId.

### 🔵 A4 — Inconsistent refresh-token write — ✅ FIXED (2026-07-03, via session-backed auth rework)
**Fix applied:** Obsolete — `createRefreshToken`/`upsertRefreshToken` no longer exist. Both `register` and `login` now call the identical `issueSession` helper.

`register` uses `createRefreshToken` (l.61) while `login` uses `upsertRefreshToken` (l.90). Harmless for a brand-new user, but inconsistent — prefer `upsert` in both.

---

# Module — Users

### 🟠 U1 — `deleteUser` hard-deletes — ✅ FIXED (2026-07-03)
**Fix applied:** Removed user deletion entirely (endpoint, controller, service, repo). Per product decision, **users are never deleted** — locking is the ban mechanism (a locked user fails login), which preserves order/history integrity. See `docs`/memory `feedback-no-user-deletion`.

**Location:** `src/services/user.service.ts:75`, `src/repositories/user.repo.ts:45`
`prisma.user.delete(...)` on a user with orders hits an FK constraint (confusing 400 via P2003) or, if cascades exist, destroys order/review history. There is also no guard preventing an admin from deleting themselves or another admin.
**Fix:** Soft-delete (add `isDeleted`/`isActive`), or block deletion when the user has orders. Add a guard: an admin cannot delete/lock themselves or another `ROLE_ADMIN`.

### 🟡 U2 — No privilege guard on lock/delete — ✅ FIXED (2026-07-03)
**Fix applied:** `toggleLock` now takes the caller's id. When **locking**, it rejects locking your own account (`CANNOT_LOCK_SELF`, 403) or another admin (`CANNOT_LOCK_ADMIN`, 403). Unlocking is unrestricted so an auto-locked admin can be recovered. Delete path removed (see U1). Runtime-verified all four cases.

**Location:** `src/services/user.service.ts:63,75`
`toggleLock` / `deleteUser` can target any user including admins. One admin can lock out another (or themselves).
**Fix:** Reject the operation when the target is an admin or is the caller.

---

# Module — Address

### 🟡 AD1 — "Max 5 addresses" is not enforced — ✅ FIXED (2026-07-03)
**Fix applied:** `createAddress` now rejects the 6th with `ADDRESS_LIMIT_REACHED` (409). Verified.

**Location:** `src/services/address.service.ts:15-38`
`createAddress` calls `countUserAddresses` but only uses the count to decide the default flag — it never rejects at a limit. PROGRESS.md / memory claim a 5-address cap that does not exist in code.
**Fix:** Either enforce `if (count >= 5) throw ...` or remove the claim from the docs.

### 🟡 AD2 — Default-address change is not atomic — ✅ FIXED (2026-07-03)
**Fix applied:** `createAddress`/`updateAddress` now do the unset-others + write inside a single `$transaction` (repo layer). Also enforced the full industry "single default" invariant: first address is auto-default, the default flag can only be moved (never turned off → never zero defaults), and deleting the default promotes another. Verified.

**Location:** `createAddress` (l.22-26) and `updateAddress` (l.49-53)
Both call `unsetDefaultAddresses(userId)` and then separately create/update. If the second call fails, the user is left with **no** default. (`setDefaultAddressTransaction` already exists for the dedicated set-default path — the create/update paths should use the same pattern.)
**Fix:** Wrap unset + create/update in a single `$transaction`.

### 🔵 AD3 — `deleteAddress` doesn't pre-check order references — ✅ FIXED (2026-07-03)
**Fix applied:** `deleteAddress` counts referencing orders first and throws a clear `ADDRESS_IN_USE` (409) instead of relying on the FK error. Verified. **Also (bonus, requested):** checkout now falls back to the user's default address when `addressId` is omitted (`addressId` made optional on place-order / initiate / COD; new `resolveDeliveryAddress` helper).

**Location:** `src/services/address.service.ts:74`
If the address is referenced by an order, deletion relies on the DB FK error → surfaces as a misleading "Referenced record does not exist" 400.
**Fix:** Check for referencing orders and throw a clear domain error, or soft-delete.

---

# Module — Cart

### 🔵 CA1 — Unavailable items still counted in subtotal — ✅ FIXED (2026-07-03)
**Fix applied:** `getCart` now tags each item with `isAvailable` (active variant + visible product + enough stock), excludes unavailable items from `subtotal`, and returns a top-level `hasUnavailableItems` flag. Verified.

**Location:** `src/services/cart.service.ts:16-28`
`getCart` sums every item; if a product later becomes disabled/deleted or a variant inactive, it's still priced into the subtotal with no "unavailable" flag. Checkout will reject it, but the cart view misleads.
**Fix:** Mark unavailable items and exclude them from the subtotal (or surface a warning).

### 🔵 CA2 — `updateCartItem` doesn't check product state — ✅ FIXED (2026-07-03)
**Fix applied:** `updateCartItem` now rejects a disabled/deleted product (`PRODUCT_UNAVAILABLE`), matching `addToCart`. The update-repo query was extended to fetch product state. Verified.

**Location:** `src/services/cart.service.ts:51-63`
`addToCart` checks `product.isDeleted/isDisabled`; `updateCartItem` only checks `variant.isActive` + stock. Inconsistent — a quantity update on a now-disabled product succeeds.
**Fix:** Apply the same availability check as `addToCart`.

---

# Module — Products & Variants

### 🟡 P1 — No cross-field price validation — ✅ FIXED (2026-07-03)
**Fix applied:** `createProductSchema` refines `discountedPrice <= price`; `updateProduct` validates the merged final values (`INVALID_PRICING`, 400). Verified both paths.

**Location:** `src/validators/product.schema.ts:36-38`
`price`, `discountedPrice`, `discountPercentage` are validated independently. You can create `discountedPrice > price` (negative discount) or a `discountPercentage` inconsistent with the prices. This bad data flows into cart/order subtotals.
**Fix:** Add `.refine()` ensuring `discountedPrice <= price` and (if present) that `discountPercentage` is consistent.

### 🟡 P2 — Public product detail returns inactive variants — ✅ FIXED (2026-07-03)
**Fix applied:** `findProductById` no longer overrides the include — it uses `productInclude` which filters to active variants. Verified (detail returns active-only).

**Location:** `src/repositories/product.repo.ts:33-40`
`findProductById` spreads `productInclude` (which filters `variants: { where: { isActive: true } }`) then **overrides** `variants` with an order-by clause that drops the `isActive` filter. So the public `GET /products/:id` exposes inactive variants, unlike the list endpoints.
**Fix:** Keep the `where: { isActive: true }` filter in the override (or intentionally split admin vs public detail).

### 🟡 P3 — `deleteVariant` hard-deletes — ✅ FIXED (2026-07-03)
**Fix applied:** `deleteVariant` blocks when the variant is referenced by an order (`VARIANT_IN_USE`, 409) — deactivate instead. Unreferenced variants still hard-delete (cart items cascade). Verified both cases.

**Location:** `src/services/product.service.ts:160`, `src/repositories/product.repo.ts:237`
A variant referenced by cart items or order items will fail the FK (confusing 400) or, with cascades, damage order history.
**Fix:** Soft-delete variants (`isActive = false` already exists) or block when referenced by orders.

### 🔵 P4 — Inline variant SKU dupes not pre-checked — ✅ FIXED (2026-07-03)
**Fix applied:** `createProduct` now checks inline SKUs are unique within the request and globally (`findExistingSkus`) → clean `SKU_ALREADY_EXISTS` instead of a raw DB error. Verified both cases.

**Location:** `src/repositories/product.repo.ts:115-148`
`createProduct` writes `variants[]` straight through; unlike `addVariant`, there's no SKU-duplicate pre-check, so a dupe surfaces as a raw P2002.
**Fix:** Validate SKU uniqueness for inline variants before create for a consistent error.

### 🔵 P5 — Search `minPrice`/`maxPrice` not ordered — ✅ FIXED (2026-07-03)
**Fix applied:** `productSearchSchema` refines `minPrice <= maxPrice` → clean 400 instead of silently returning empty. Verified.

**Location:** `src/validators/product.schema.ts:108-109` — no check that `minPrice <= maxPrice`. Silently returns empty.

---

# Module — Categories & Brands

### 🟡 CB1 — Soft-deleted category permanently burns its title — ✅ FIXED (2026-07-03)
**Fix applied:** `createCategory` only blocks on a *non-deleted* existing title; if a soft-deleted category with that title exists it's revived (`reviveCategory` → `isDeleted/isDisabled=false` + new details). Verified (same row reused).

**Location:** `src/services/category.service.ts:7-9`, `src/repositories/category.repo.ts:7`
`categoryTitle` is DB-unique and `findCategoryByTitle` (a plain `findUnique`) also matches soft-deleted rows. Once a category is soft-deleted you can never create another with the same title.
**Fix:** Exclude `isDeleted` rows from the uniqueness check and reactivate/rename the tombstone, or use a partial unique index.

### 🟡 CB2 — Deleting a category orphans its products — ✅ FIXED (2026-07-03)
**Fix applied:** `softDeleteCategory` is now a transaction that marks the category deleted AND disables its active products, so they no longer stay visible under a deleted category. Verified.

**Location:** `src/repositories/category.repo.ts:22-23`
`softDeleteCategory` only sets `category.isDeleted`. Unlike `setCategoryDisabled` (which cascades `isDisabled` to products in a transaction), delete leaves the category's products active and visible, now pointing at a "deleted" category.
**Fix:** Cascade a disable/delete to the category's products within a transaction.

### 🟡 CB3 — `deleteBrand` hard-deletes — ✅ FIXED (2026-07-03)
**Fix applied:** `deleteBrand` now nulls `brandId` on referencing products (in a transaction) so products stay intact, and returns `affectedProducts`; the controller surfaces a warning message + count to the admin. Verified (1 product detached, brand deleted).

**Location:** `src/services/brand.service.ts:64-79`
Brands are referenced by `products.brandId`. Hard-deleting a brand in use fails the FK (or requires `SetNull`).
**Fix:** Null out `brandId` on affected products in a transaction, or block deletion when referenced.

---

# Module — Wishlist

### 🔵 W1 — Wishlist returns deleted/disabled products — ✅ FIXED (2026-07-03)
**Fix applied:** `findWishlistByUser` now filters `product: { isDeleted: false, isDisabled: false }`, so deleted/disabled products are omitted from the wishlist. Verified.

**Location:** `src/repositories/wishlist.repo.ts:26-31`, `src/services/wishlist.service.ts:23-26`
`findWishlistByUser` doesn't filter `isDeleted`/`isDisabled` (the flags are selected, so the frontend *can* filter, but the API returns them).
**Fix:** Filter out unavailable products, or document that the client must.

*(Add/remove/check paths are clean — ownership and dup handling are correct.)*

---

# Module — Coupons

### 🟡 CP1 — Usage limit is not atomic — ✅ FIXED (2026-07-03)
**Fix applied:** Coupon usage now rides the same reserve/consume/release lifecycle as stock. `reserveCoupon` (in the order-creation transaction) does an **atomic guarded increment** via raw SQL (`SET usageCount = usageCount+1 WHERE usageLimit IS NULL OR usageCount < usageLimit`) — 0 rows affected → `COUPON_USAGE_LIMIT_REACHED`, so the global limit can't be exceeded under concurrency. Released on payment failure/expiry (`failPendingPayment`, sweep). Verified: over-limit rejected, counter never exceeds, release frees the slot.

**Location:** `src/services/coupon.service.ts:142` (check) vs increment inside `confirmPaymentTransaction`
The `usageCount >= usageLimit` check happens at validate/initiate time; the increment happens much later at confirm. Concurrent orders can both pass and push usage past the limit.
**Fix:** Enforce the limit atomically at increment time (conditional `updateMany` on `usageCount < usageLimit`, roll back if it fails).

### 🟡 CP2 — No per-user cap; `registeredOnly` is dead — ✅ FIXED (2026-07-03)
**Fix applied:** Added a `perUserLimit` field + a `CouponRedemption` ledger (row per coupon/user/order). `reserveCoupon` counts the user's redemptions and rejects at the cap (`COUPON_USER_LIMIT_REACHED`). The dead `registeredOnly` flag was **removed** entirely (schema, validator, service, types, Swagger). Migration `coupon_redemption_peruser`. Verified.

**Location:** `coupon.service.ts` / schema `registeredOnly`
Nothing limits a single user reusing a coupon across many orders, and the `registeredOnly` flag is stored but never checked anywhere.
**Fix:** Add a per-user usage record/limit if intended; enforce or remove `registeredOnly`.

*(Scope-aware validation, date/active/limit checks, and the `zod/v4` note (C3) apply here.)*

---

# Module — Orders

### 🟠 O1 — Legacy `POST /orders` places orders with no payment — ✅ FIXED (2026-07-04)
**Fix applied:** Removed the legacy `POST /orders` + `/orders/single` entirely (routes, controllers, services, dead `createOrderWithItems`/`OrderCreateData`, `placeOrderSchema`, swagger). Orders are now created only via the payment module (`/payment/initiate`, `/payment/cod`), which reserves stock and gates on payment.

**Location:** `src/services/order.service.ts:114-163` (`placeOrder`), `order.repo.ts` (`createOrderWithItems`)
This path creates a full order, **decrements stock, and clears the cart** with `paymentStatus: PENDING` and no payment gate — running in parallel to the Razorpay/COD payment module. Any authenticated user can place unlimited unpaid orders, reserving/depleting inventory.
**Fix:** Decide the single source of truth. If the payment module owns checkout, remove or lock down `POST /orders` & `/orders/single` (or repurpose them strictly for an authenticated COD/bank-transfer flow that doesn't deduct stock until confirmed).

### 🟡 O2 — `uploadProof` has no status guard and can revive dead orders — ✅ FIXED (2026-07-04)
**Fix applied:** The payment-proof upload feature was **removed entirely** (route, controller, service, `updateOrderProof`, schema, swagger) — it was a leftover from before the payment module and no longer fits. Nothing can revive an order via a feature that doesn't exist.

**Location:** `src/services/order.service.ts:257-270`, `order.repo.ts` `updateOrderProof`
`uploadProof` doesn't check order status, and the repo unconditionally sets `orderStatus: "ORDER_PLACED"`. Uploading proof on a CANCELLED/DELIVERED order silently flips it back to ORDER_PLACED.
**Fix:** Restrict to eligible statuses; don't force status backward.

### 🟡 O3 — Admin status updates have no state machine + stock leak — ✅ FIXED (2026-07-04)
**Fix applied:** `adminUpdateOrderStatus` now enforces a `STATUS_TRANSITIONS` map (invalid moves → `INVALID_STATUS_TRANSITION`), and setting `CANCELLED` routes through the stock-restoring, refund-aware `cancelOrderTransaction` (recorded as ADMIN) — no more stock leak. Verified.

**Location:** `src/services/order.service.ts:298-307`
Any status → any status is allowed. Critically, setting status to `CANCELLED` here does **not** restore stock (only the customer `cancelOrderTransaction` does), so admin-cancellation leaks inventory. Reverse transitions (e.g. DELIVERED → PENDING) are also unguarded.
**Fix:** Enforce a valid transition map; route cancellation through the stock-restoring transaction.

### 🟡 O4 — `adminDeleteOrder` hard-deletes financial history — ✅ FIXED (2026-07-04)
**Fix applied:** `adminDeleteOrder` blocks deletion when `paymentStatus === COMPLETED` (`CANNOT_DELETE_PAID_ORDER`, 409), preserving the payment audit trail. Unpaid/junk orders can still be deleted. Verified.

**Location:** `src/services/order.service.ts:319-323`
`Payment` has `onDelete: Cascade`, so deleting an order wipes its entire payment audit trail.
**Fix:** Block deletion of orders with payments, or soft-delete/archive instead.

### 🟡 O5 — Cancelling a paid order leaves no refund trace — ✅ FIXED (2026-07-04)
**Fix applied:** Added Order refund fields (`refundStatus` NONE/REFUND_PENDING/REFUNDED, `cancelledBy`, `cancelledAt`, `refundedAt`; migration `order_refund_tracking`). Cancelling a **paid** order (customer or admin) now sets `refundStatus = REFUND_PENDING` + records who cancelled, keeps `paymentStatus = COMPLETED`, restores stock, and releases the coupon. New admin endpoint `PUT /orders/admin/:orderId/refund` marks it `REFUNDED` after the manual Razorpay refund (`NO_REFUND_PENDING` if none owed). Unpaid cancels → `refundStatus` stays NONE. Verified. Razorpay refund-API automation remains a deferred follow-up.

**Location:** `cancelOrder` (l.243) — `ORDER_PLACED` is cancellable even when `paymentStatus === COMPLETED`. Stock is restored, order CANCELLED, but nothing records that a refund is owed.

---

# Module — Payments

*(The core flow was hardened during this session — webhook idempotency, amount validation, fraud audit records, and verify-returns-CONFIRMED-when-webhook-wins are all in good shape.)*

### 🟡 PM1 — Audit trail is write-only — ✅ FIXED (2026-07-04)
**Fix applied:** New admin endpoint `GET /payment/admin/order/:orderId` returns the full payment audit trail (all sources, newest-first) via `adminGetOrderPayments`. Verified.

**Location:** `src/repositories/payment.repo.ts:19-26`
`findPaymentsByOrderId` and `findPaymentById` are defined but **never** wired to any controller/route. All the carefully-written `Payment` audit records (FRONTEND_VERIFY / WEBHOOK / FRAUD_* / FETCH_FAILED) can't be read through the API.
**Fix:** Add an admin endpoint, e.g. `GET /admin/orders/:orderId/payments`.

### 🔵 PM2 — Three identical checkout schemas — ✅ FIXED (2026-07-04)
**Fix applied:** Collapsed into a single `checkoutSchema`; the three names now alias it. Typecheck clean.

**Location:** `src/validators/payment.schema.ts` — `initiatePaymentSchema`, `initiatePaymentSingleSchema`, `codCheckoutSchema` are identical. Collapse into one.

### 🔵 PM3 — Concurrency note — ✅ RESOLVED (2026-07-04, via C2)
Covered by the C2 fix — the reservation system + atomic guarded decrement make the confirm path race-proof. Nothing further needed.

Stock is only deducted at confirm (good — no leak on abandoned payment), but the confirm decrement shares the **C2** oversell race. Fix C2 and this is covered.

---

# Module — Reviews

### 🟡 R1 — No verified-purchase requirement — ✅ FIXED (2026-07-04)
**Fix applied:** `createReview` now requires a verified purchase — `hasPurchasedProduct` checks the user has a paid, non-cancelled order containing the product (`REVIEW_NOT_PURCHASED`, 403). Verified (blocked before purchase, allowed after).

**Location:** `src/services/review.service.ts:16-38`
Any authenticated user can review any visible product without having purchased it. Enables review spam.
**Fix:** If desired by the business, require a delivered order containing the product before allowing a review.

### 🟡 R2 — `numRatings` stores the *average*, not a count — ✅ FIXED (2026-07-04)
**Fix applied:** Renamed the field `numRatings` → `avgRating` (migration `rename_numratings_avgrating`) so it's honestly named; `totalReviews` remains the count. The `"popular"` sort now orders by `totalReviews desc` (most-reviewed = popular) instead of by average. Verified (avgRating=5, totalReviews=1 after one 5★ review).

**Location:** `src/repositories/review.repo.ts:70-82`
`recalcProductRating` writes the **average** rating into `numRatings` and the count into `totalReviews`. The name `numRatings` strongly implies a count, and `buildSortOrder`'s `"popular"` case (`product.repo.ts:26`) sorts by `numRatings desc` — i.e. by average rating, not by popularity/volume. Frontends reading `numRatings` as a count will be wrong.
**Fix:** Rename to `avgRating` for clarity, and decide whether "popular" should sort by `totalReviews` (volume) or by average.

*(One-review-per-user is correctly enforced via the composite unique key; rating recalculation on create/update/delete is correct.)*

---

# Module — Feedback & Contact

### 🟡 CN1 — Contact replies aren't stored; resolved even on email failure — ✅ FIXED (2026-07-04)
**Fix applied:** Added `replyMessage` + `repliedAt` to `ContactMessage` (migration `contact_reply_fields`). `adminReplyToContact` now **awaits** the email and, on failure, throws `CONTACT_REPLY_EMAIL_FAILED` (502) — the reply is **not** stored or resolved, so the admin can retry. On success, `saveReply` persists the reply text + timestamp and marks resolved. Verified both paths.

**Location:** `src/services/contact.service.ts:42-57`
`adminReplyToContact` fires the email (fire-and-forget, `.catch(() => undefined)`) and then marks the contact resolved regardless of whether the email actually sent. The reply text is never persisted, so there's no history of what was sent.
**Fix:** Persist the reply (and/or a `repliedAt`), and only mark resolved after a successful send (or record send status).

### 🔵 CN2 — Public submit endpoints are spam-exposed — ✅ FIXED (2026-07-04)
**Fix applied:** Added a `website` honeypot field to both submit schemas; if a bot fills it, the controller returns a fake success and **drops** the submission (nothing stored). Verified (honeypot → 0 rows, clean → stored). Full captcha remains a frontend option if abuse grows.

**Location:** `submitContact` / `submitFeedback` are public, protected only by the write rate limiter. Consider a captcha/honeypot if abuse appears. (Schemas have good max-length caps — nice.)

---

# Module — FAQ & Store Info

Clean. Singleton upsert for store info is correct; FAQ CRUD is straightforward; `getStoreInfo` throws a clear error when unset. No findings.

---

# Module — Upload

**Well done — no findings.** Folder allowlist (`categories|brands|products`), MIME allowlist (`jpeg|png|webp`), 5 MB cap, admin-only route, presigned PUT with 15-min expiry and enforced `ContentLength`. This is the model the other modules' delete/validation paths should aspire to.

---

# Admin Setup-Status

Clean. Parallelized checks, sensible critical/warning split, clear messages. No findings.

---

## Appendix — Doc drift noticed

- Coupon type is `PERCENTAGE | FIXED` in both the Prisma enum and the schema; PROGRESS.md/memory referencing **"FLAT"** are stale.
- Address "max 5 per user" is documented but **not implemented** (AD1).
- `.env` still ships placeholder secrets (`JWT_SECRET="change_me..."`, weak `PASSWORD_PEPPER`) — must be replaced before production (config, not code).

---
---

# HoH Backend — Code Review · Round 2

**Reviewer:** Claude (Fable 5)
**Date:** 2026-07-04
**Scope:** Fresh full-backend pass, module-by-module across every layer (routes → controllers → services → repositories → validators → schema), done *after* all Round-1 findings were fixed. Round-1 fixes were re-verified in passing — they all hold.
**Security bar:** Calibrated for a startup — solid medium-range security, not enterprise hardening. Things deliberately **not** flagged at this stage: WAF/captcha, distributed rate limiting, OTP hashing at rest, field-level encryption, automated Razorpay refunds, audit-log immutability.

> Overall: the codebase is in genuinely good shape. Auth (session-backed, hashed rotating refresh tokens, timing-safe login, OTP attempt limits), the inventory-reservation system, coupon reserve/release lifecycle, and the 3-layer payment verification are all above the bar for a startup. The findings below are mostly **concurrency edges in the payment confirm path, a few lifecycle gaps (locked accounts, COD), and small cleanups**. Nothing here is "rewrite" territory.

---

## Executive summary — prioritized fix list (Round 2)

1. 🟠 **Double-confirm race** — `verifyPayment` and the webhook can both run `confirmPaymentTransaction` concurrently; stock can be deducted twice. *(R2-C1)*
2. 🟠 **`payment.failed` webhook cancels the order while the customer can still retry** — a later successful attempt resurrects a CANCELLED order (or strands a captured payment). *(R2-C2)*
3. 🟠 **Password reset doesn't unlock a locked account** — a user auto-locked by failed logins can reset their password and *still* can't log in. *(R2-A1)*
4. 🟡 **COD is marked `paymentStatus: COMPLETED` at placement** — cancelling an undelivered COD order flags a phantom refund; reviews unlock before delivery. *(R2-O3)*
5. 🟡 **Anyone can lock any account** (5 wrong passwords, no auto-unlock). *(R2-A2)*
6. 🟡 **COD failure leaves orphan PENDING orders** the sweep will never clean up. *(R2-O2)*
7. 🟡 **Webhook crashes on non-payment events**; **admin payment-status override bypasses stock/refund logic**; **own-password change doesn't revoke other sessions**; **images deleted from R2 before the DB write**. *(R2-C3, R2-O1, R2-U1, R2-P1)*

---

  # Cross-cutting / payments infrastructure

### 🟠 R2-C1 — Verify + webhook double-confirm race can deduct stock twice
**Location:** `src/repositories/order.repo.ts` (`confirmPaymentTransaction`), callers in `src/services/payment.service.ts` (`verifyPayment` l.292, `handleWebhook` l.497)
Both callers check `order.paymentStatus === "COMPLETED"` **before** entering the transaction, but nothing re-checks it **inside**. If the frontend verify and the Razorpay webhook land at the same moment (common — the webhook often fires within a second of capture), both pass the outside check and both run the transaction. The first flips the reservations ACTIVE→CONSUMED; the second sees `cas.count === 0`, assumes the hold was swept, and **re-deducts stock via `decrementStock`** (`reservation.repo.ts:84`). Result: stock deducted twice for one paid order, plus two `COMPLETED` Payment rows.
**Impact:** Silent inventory shrinkage on exactly the orders that pay successfully. Hard to notice, annoying to reconcile.
**Fix:** Make the confirm idempotent *inside* the transaction — first statement should be a CAS:
```ts
const won = await tx.order.updateMany({
  where: { orderId, paymentStatus: { not: "COMPLETED" } },
  data: { paymentStatus: "COMPLETED" },
});
if (won.count === 0) return existing order; // other path already confirmed
```
(then proceed with consume/cart-clear/payment-record as today).

### 🟠 R2-C2 — `payment.failed` cancels the order while the payment window is still open
**Location:** `src/services/payment.service.ts:551-580` (`handleWebhook`, `payment.failed` branch) → `order.repo.ts` `failPendingPayment`
Razorpay fires `payment.failed` for **every failed attempt** — wrong OTP, insufficient funds, timeout — and customers routinely retry inside the same Razorpay checkout (same `razorpayOrderId`). Today the first failed attempt immediately cancels the HoH order, releases the stock hold, and returns the coupon slot. If the customer's retry then succeeds:
- `verifyPayment` throws `PAYMENT_ORDER_ALREADY_CANCELLED` — the customer paid and sees an error.
- The `payment.captured` webhook branch only checks `paymentStatus === "COMPLETED"`, **not** `orderStatus === "CANCELLED"`, so it happily runs `confirmPaymentTransaction` on the cancelled order: the holds are RELEASED so it falls back to guarded re-decrements (may throw `PAYMENT_STOCK_CONFLICT` if someone else bought the stock — money captured, order dead), and the coupon slot that was released is **never re-reserved** even though `couponDiscount` is still baked into the paid total.
**Impact:** Every "failed first attempt, successful retry" flow — one of the most common real-world payment patterns in India — lands in an inconsistent state.
**Fix:** Don't cancel on `payment.failed`; just record the FAILED audit row. Abandonment is already owned by the reservation TTL + sweep (15 min), which is the right owner. And in the `payment.captured` branch, explicitly handle `orderStatus === "CANCELLED"` (refuse + flag for refund) instead of confirming through it.

### 🟡 R2-C3 — Webhook handler assumes every event is a payment event
**Location:** `src/services/payment.service.ts:484-487`
```ts
const payment = payload.payload.payment.entity;
```
runs **before** the `event` type is checked. Any non-payment event enabled in the Razorpay dashboard (`order.paid`, `refund.processed`, `settlement.*`…) has a different payload shape → TypeError. The controller's try/catch still returns 200 (good — no retry storm), but the event is dropped and logged as an "unhandled error", which will pollute error monitoring the day someone toggles an extra event on.
**Fix:** Check `event` first (early-return for anything not `payment.captured`/`payment.failed`), or use optional chaining with an explicit "unhandled event" info log.

### 🟡 R2-C4 — Money stored as `Float`
**Location:** `prisma/schema.prisma` — `Order` (totalPrice/totalAmount/…), `Payment.amount`, `Coupon.value/minOrderValue/maxDiscount`, `StoreInfo.shippingCharge`
Product/variant prices are already integers (rupees) — good — but everything downstream of a percentage coupon is Float: `calcCouponDiscount` rounds to 2dp (`order.helpers.ts:75`), then totals/paise conversions ride IEEE-754 floats. `Math.round(x*100)` currently papers over it, and the verify path compares rounded paise on both sides, so nothing is broken *today* — but every new consumer of these columns (refund amounts, reports, settlement reconciliation) re-inherits the foot-gun.
**Fix (startup-sized):** Store money as integer paise (Int) or `Decimal`. If migrating now is too disruptive, at minimum round coupon discounts to whole rupees (`Math.round(discount)`) so all stored amounts stay integral.

### 🔵 R2-C5 — `deleteStaleSessions` exists but is never scheduled
**Location:** `src/repositories/auth.repo.ts:151`, `src/config/boss.ts`
The repo comment says "run on a cron so the table stays bounded", but pg-boss only schedules the reservation sweep. Expired/revoked sessions accumulate forever (every login is a row; multi-device means several per user).
**Fix:** Add a second pg-boss queue (daily is plenty) calling `deleteStaleSessions()`.

---

# Module 1 — Auth

### 🟠 R2-A1 — Password reset doesn't unlock the account — ✅ FIXED (2026-07-05)
**Fix applied:** Redesigned lockout as a **temporary cooldown** (migration `login_cooldown`, new `User.lockedUntil`). `locked` is now reserved strictly for **admin bans**; 5 wrong passwords set `lockedUntil = now + 15min` instead of a permanent lock. The forgot-password reset (`updateUserPassword`) now clears `failedLoginAttempts` + `lockedUntil` — a genuine self-service escape hatch — while leaving an admin `locked` ban untouched. Since permanent auto-lock no longer exists, the "reset can't unlock me" trap is gone. Typecheck clean; migration applied.

**Location:** `src/services/auth.service.ts` (`changePassword`)
The forgot-password flow proves inbox ownership, sets the new password, and revokes all sessions — but never clears `locked` or `failedLoginAttempts`. So a user who was auto-locked by 5 failed attempts (the *typical* reason someone resets their password) completes the whole OTP reset successfully and then still gets `ACCOUNT_LOCKED` at login. There is no self-service way out; only an admin unlock. For an admin-locked (banned) user the current behavior is *correct* — but the code can't tell the two cases apart.

### 🟡 R2-A2 — Anyone can lock any account; lock is permanent — ✅ FIXED (2026-07-05, via the R2-A1 cooldown redesign)
**Fix applied:** Resolved by the same change. 5 wrong passwords now impose a **self-expiring 15-minute cooldown** (`lockedUntil`), not a permanent lock — so griefing is reduced to a 15-min window that heals itself, and the cooldown is checked **before** the password compare, so it doubles as a per-account brute-force throttle. The stale read-modify-write on the counter remains (single-attacker self-race only, cosmetic) — not worth an atomic increment here. New `LOGIN_COOLDOWN` (429) error surfaces the minutes remaining.

**Location:** `src/services/auth.service.ts` (`login`), `accountLockedAt` unused
Five wrong passwords on a victim's email permanently locks it — a trivial griefing vector (the auth limiter's 20 req/15 min per IP still allows locking ~4 accounts per window per IP). `accountLockedAt` is recorded but nothing ever uses it. Also, the counter update is read-modify-write (`user.failedLoginAttempts + 1` from a stale read) instead of an atomic `{ increment: 1 }`.

### 🔵 R2-A3 — Verified-email state is unbound and never expires — ✅ FIXED (2026-07-05)
**Fix applied:** On OTP verification, `markEmailVerified` now repurposes `expiresAt` as a **30-minute deadline** for the verified state; `register` rejects with `EMAIL_VERIFICATION_EXPIRED` (400) once it passes, forcing a re-verify. This shrinks the "stale verified email gets claimed by someone else" window from forever to 30 min. Typecheck clean; migration applied. (Residual: within that 30-min window the verify step still isn't cryptographically bound to the registrant — a signed registration token would close it fully, deferred as it changes the client contract for a low-risk edge.)

**Location:** `src/services/auth.service.ts` (`verifyRegistrationOtp` → `register`)
Once an `EmailVerification` row is `isVerified`, it stays valid forever, and `register` isn't tied to whoever did the verification — in the window between OTP verify and register, anyone who submits `register` with that email first claims the account with their own password. Narrow window, low practical risk.

### 🔵 R2-A4 — No per-email cooldown on OTP sends — ✅ FIXED (2026-07-05)
**Fix applied:** Added `lastOtpSentAt` to both `EmailVerification` and `ForgotPassword` (migration `otp_resend_cooldown_and_verify_ttl`), stamped on every send. A 60s per-email cooldown now guards both send paths: `sendVerificationOtp` throws `OTP_RESEND_COOLDOWN` (429), while `sendForgotPasswordOtpService` returns **silently** within the cooldown so its generic response is unchanged (preserves anti-enumeration). Typecheck clean.

`sendVerificationOtp` / `sendForgotPasswordOtpService` will happily email the same address on every request up to the IP rate limit — third-party email bombing plus Resend quota burn. A 60s per-email cooldown (check the last-sent time on the existing row before upserting) is enough.

---

# Module — Users

### 🟡 R2-U1 — Changing your own password doesn't revoke other sessions — ✅ FIXED (2026-07-06)
**Fix applied:** `changeOwnPassword` now takes the caller's `sessionId` and, after the password update, calls the new `authRepo.revokeOtherUserSessions(userId, sessionId)` — revoking every active session **except** the current device. Any intruder is logged out on their next request (session-backed auth checks live), while the user stays logged in where they made the change. Typecheck clean.

**Location:** `src/services/user.service.ts` (`changeOwnPassword`)
The forgot-password flow revokes all sessions after a reset (`auth.service.ts`), but the logged-in change-password flow revokes nothing. The classic reason a user changes their password is "I think someone has my account" — and that someone's session (and refresh cookie) stays fully valid for up to 7 more days.

### 🔵 R2-U2 — `mobile` accepts any string — ✅ FIXED (2026-07-06)
**Fix applied:** Both `registerSchema` and `updateProfileSchema` now validate `mobile` with `.regex(/^[6-9]\d{9}$/)` (10-digit Indian mobile) and a clear error message. Keeps garbage out of the Razorpay notes / shipping contact number. Validation-only — no migration. Typecheck clean.

`registerSchema` and `updateProfileSchema` take `mobile: z.string().optional()` — no format check. It's fed into Razorpay notes and shipping flows.

---

# Module — Address

### 🔵 R2-AD1 — Delete + promote-new-default is not atomic — ✅ FIXED (2026-07-06)
**Fix applied:** New `deleteAddressWithPromotion(addressId, userId, wasDefault)` repo function wraps the delete **and** the promote-most-recent step in a single `$transaction`, so a crash mid-way can no longer leave the account with zero defaults — matching the create/update pattern from Round 1. Removed the now-dead `deleteAddress` / `setDefaultAddress` / `findMostRecentAddress` repo helpers. Typecheck clean.

**Location:** `src/services/address.service.ts` (`deleteAddress`)
`deleteAddress` deletes, then separately promotes the most recent address to default. A crash between the two leaves zero defaults (the invariant the module otherwise enforces carefully).

---

# Module — Cart

Clean. One nit: 🔵 **R2-CA1** — ✅ FIXED (2026-07-06) — `addToCart`'s find-then-create could race with itself (double-tap / retry) and surface a raw `409 CONFLICT` from the `@@unique([cartId, variantId])` constraint instead of merging quantities. Now the create is wrapped in a try/catch: on a P2002 unique violation it re-fetches the row the concurrent request just inserted and merges quantities (with the same stock cap), so the user gets the expected result instead of a conflict. Duck-typed P2002 check keeps the service Prisma-import-free. Typecheck clean.

---

# Module — Products & Variants

### 🟡 R2-P1 — Replaced images are deleted from R2 *before* the DB write — ✅ FIXED (2026-07-06)
**Fix applied:** All three services now snapshot the old image key(s), run the DB update **first**, and only best-effort delete the replaced objects **after** the write succeeds — `product.service.ts` (`updateProduct`, all 4 image slots), `category.service.ts`, and `brand.service.ts` (keeps the "orphaned only if no other brand uses it" check). Worst case is now a harmless orphaned R2 object instead of a broken image. Typecheck clean.

**Location:** `src/services/product.service.ts` (`updateProduct`); same pattern in `category.service.ts` and `brand.service.ts`
The old image is deleted from R2 first, then the DB update runs. If the update fails (DB down, constraint, whatever), the row still points at an object that no longer exists → permanently broken image.

### 🔵 R2-P2 — `discountPercentage` is decorative and can contradict the prices — ✅ FIXED (2026-07-06)
**Fix applied:** `discountPercentage` is now **always computed server-side** from price/discountedPrice (`round((1 - discounted/price) * 100)`) in `product.repo.ts` on both create and update, so it can never contradict the actual prices. Removed it as an accepted input (create + update Zod schemas and the Swagger `CreateProductInput`). Typecheck clean.

Round 1 fixed `discountedPrice <= price`, but `discountPercentage` was still stored independently — an admin could set price 1000, discountedPrice 900, discountPercentage 50.

### 🔵 R2-P3 — `GET /products/all` is public and unpaginated — ✅ FIXED (2026-07-06)
**Fix applied:** `/products/all` is now paginated — repointed to the existing paginated `getAllProducts` handler (page/limit≤100/sortBy, same as `GET /products`), and the dead no-pagination controller/service/repo functions were removed. Swagger updated with the pagination params. **Note:** the response shape for `/products/all` changed from a bare array to the paginated `{ products, total, page, limit, totalPages }` envelope — frontend consumers of this endpoint must adjust.

**Location:** `product.routes.ts`
Returned the entire catalog with variants/brand/category on every hit, behind only the read limiter (500/15min). Fine at 50 products, a self-inflicted load test at 5,000.

---

# Module — Categories & Brands

Clean after Round 1. (The image-ordering issue is covered by R2-P1, which applies to both services.)

---

# Module — Wishlist

Clean. No new findings.

---

# Module — Coupons

### 🔵 R2-CP1 — `perUserLimit` check is not atomic — ✅ FIXED (2026-07-06)
**Fix applied:** `reserveCoupon` now takes a transaction-scoped Postgres **advisory lock** keyed on `(couponId, userId)` (`pg_advisory_xact_lock(hashtext(couponId), hashtext(userId))`) before the count-then-insert, serializing a single user's concurrent checkouts so the per-user cap can't be raced past by one. Row locks couldn't help (the racing rows don't exist yet — a phantom read); the advisory lock is the minimal fix and auto-releases at commit/rollback. Different users never contend, and the global counter's guarded UPDATE already handled cross-user races. `reserveCoupon` always runs inside the order transaction, so the lock scope is correct. Typecheck clean.

**Location:** `src/repositories/coupon.repo.ts` (`reserveCoupon`)
The global limit uses an atomic guarded UPDATE (nice), but the per-user cap is count-then-insert — a user racing two checkouts of their own can exceed their cap by one. Self-race only, so low value to an attacker.

### 🔵 R2-CP2 — Public coupon endpoint exposes full internal config — ✅ FIXED (2026-07-06)
**Fix applied:** The public `getCouponByCode` now returns a trimmed `PublicCouponResult` (couponCode, couponType, couponScope, value, minOrderValue, maxDiscount, category/product for scope display, isValid, invalidReason) instead of spreading the raw row. `usageCount` / `usageLimit` / `perUserLimit` / internal ids / `isActive` / dates are no longer exposed, so a caller can't probe how close a campaign is to exhaustion. The admin list endpoint still returns full config. Typecheck clean.

**Location:** `coupon.routes.ts` → `getCouponByCode`
`GET /coupons/:code` is public and returned everything — `usageCount`, `usageLimit`, `perUserLimit`, scope internals. Combined with guessable codes (`WELCOME10`…) it invites enumeration of how close a campaign is to exhaustion.

### 🔵 R2-CP3 — Deleting a coupon cascades the redemption ledger away — ✅ FIXED (2026-07-06)
**Fix applied:** `deleteCoupon` now counts redemptions (`countRedemptions`) and throws `COUPON_HAS_REDEMPTIONS` (409) if any exist, preserving the ledger and never nuking an in-flight order's reservation row. The error message steers the admin to deactivate (`isActive: false` via update) instead — which was already supported. Unused coupons still hard-delete. Swagger documents the 409. Typecheck clean.

`CouponRedemption.coupon` is `onDelete: Cascade`, so deleting a coupon erases the history of who redeemed it (and any in-flight order's redemption row mid-lifecycle).

---

# Module — Orders

### 🟡 R2-O1 — `adminUpdatePaymentStatus` is a free-form override that bypasses everything — ✅ FIXED (2026-07-06)
**Fix applied:** `adminUpdatePaymentStatus` now enforces a `PAYMENT_STATUS_TRANSITIONS` whitelist. The only permitted manual override is `COD_PENDING → COMPLETED` (recording COD cash collected) — a pure, side-effect-free flip. Every other transition (marking online orders paid, erasing a paid order's money trail, marking failed/cancelled) is rejected with `INVALID_PAYMENT_STATUS_TRANSITION` (400) and must go through the order-status / cancel / refund flows that handle stock and refunds correctly. Same-status is a no-op. Typecheck clean. **Behavior change:** the endpoint no longer accepts arbitrary payment-status writes.

**Location:** `src/services/order.service.ts` (`adminUpdatePaymentStatus`)
Order *status* changes got a state machine in Round 1; payment status did not. An admin can set `COMPLETED` on a PENDING online order — no reservations consumed, so the sweep later returns the "sold" stock while the order says paid. Or set `FAILED` on a genuinely paid order — erasing the fact money was taken, with `refundStatus` untouched.

### 🟡 R2-O2 — Failed COD checkout strands an orphan PENDING order forever — ✅ FIXED (2026-07-06)
**Fix applied:** `placeCODOrder` and `placeCODOrderSingle` now wrap the confirm in a try/catch: if `confirmPaymentTransaction` rolls back (e.g. `OUT_OF_STOCK`), the just-created pending order is deleted before rethrowing, so it can't strand as PENDING forever (the confirm is a `$transaction`, so on throw no stock/cart/payment side effects committed — only the bare order row needs cleanup). Typecheck clean.

**Location:** `src/services/payment.service.ts` (`placeCODOrder`/`placeCODOrderSingle`)
`createPendingOrder` (no reservation) and `confirmPaymentTransaction` are two separate calls. If confirm throws — most plausibly `OUT_OF_STOCK` on the guarded decrement — the already-created order stays `PENDING/PENDING` **forever**: the sweep only finds orders via `InventoryReservation` rows, and COD orders have none.

### 🟡 R2-O3 — COD orders are `paymentStatus: COMPLETED` before any money exists — ✅ FIXED (2026-07-06)
**Fix applied:** Added a dedicated `COD_PENDING` payment status (migration `cod_pending_payment_status`). A confirmed COD order is now `COD_PENDING` (stock deducted, cash not collected) and only flips to `COMPLETED` on the `DELIVERED` transition (`adminUpdateOrderStatus`). All three symptoms resolve:
1. **Phantom refunds gone** — `cancelOrderTransaction` now distinguishes `stockDeducted` (COMPLETED **or** COD_PENDING → restore stock) from `refundOwed` (COMPLETED only → REFUND_PENDING). Cancelling an undelivered COD order restores stock with **no** refund flagged.
2. **Reviews gated** — `hasPurchasedProduct` filters on `paymentStatus: COMPLETED`, which COD_PENDING no longer satisfies, so a COD order only unlocks reviews once delivered. (No code change needed — falls out of the new status.)
3. **Junk deletable / live protected** — `adminDeleteOrder` still blocks COMPLETED (paid) and now also blocks COD_PENDING with `CANNOT_DELETE_ACTIVE_ORDER` (stock committed — cancel first to restore it).

The COD `Payment` audit row is written as `COD_PENDING` too. Typecheck clean; migration applied. **Behavior change:** COD orders report `paymentStatus: COD_PENDING` until delivered — frontend/admin views should handle the new value.

**Location:** `confirmPaymentTransaction` (COD path) + `cancelOrderTransaction` + `hasPurchasedProduct`
COD marks payment COMPLETED at placement, which three downstream consumers interpret as "money was taken" (phantom refunds, reviews unlocking before shipping, and junk COD orders being undeletable).

### 🔵 R2-O4 — Sweep/webhook cancellations don't record `cancelledBy`/`cancelledAt` — ✅ FIXED (2026-07-06)
**Fix applied:** Both system-initiated cancellation paths — `failPendingPayment` (webhook/Razorpay-create failure) and the reservation `sweepExpiredReservations` (abandoned checkout) — now set `cancelledBy: "SYSTEM"` + `cancelledAt`, so support can distinguish auto-cancellations from customer/admin ones. Typecheck clean.

Customer/admin cancels set them; `failPendingPayment` and the sweep left them null.

---

# Module — Payments

Core flow findings are R2-C1/C2/C3 above. One addition:

### 🟡 R2-PM1 — No ceiling on open COD orders per user — ✅ FIXED (2026-07-06)
**Fix applied:** Both `placeCODOrder` and `placeCODOrderSingle` now call `assertCodOrderQuota` first, which counts the user's open COD orders (`countOpenCodOrders` = `paymentStatus: COD_PENDING`, exactly the in-flight ones thanks to R2-O3) and rejects with `TOO_MANY_OPEN_COD_ORDERS` (429) at `MAX_OPEN_COD_ORDERS = 3`. Once an order is delivered (→ COMPLETED) or cancelled it no longer counts, so the cap is a rolling limit on undelivered COD orders. The optional per-order item ceiling was skipped (risks rejecting legitimate bulk buyers; the open-order cap is the real lever). Typecheck clean.

COD deducts real stock instantly with zero payment friction — one account could place COD orders until a best-seller's stock hits zero, then never accept delivery (inventory-denial).

---

# Module — Reviews

🔵 **R2-R1** — ✅ FIXED (2026-07-06) — Two nits: (1) the COD side of the verified-purchase gate is resolved by R2-O3 (a COD order only counts as a purchase once delivered → COMPLETED); (2) `adminCreateReply` now uses `createReplyWithFlag`, which inserts the reply and flips `hasAdminReply` in one `$transaction`, so a crash can't leave the flag stale. Rating recalc was already correct (full recompute, last-writer-wins with fresh data). Typecheck clean.

---

# Modules — Contact/Feedback, FAQ & Store Info, Upload, Admin

**Clean.** Honeypot works as designed (fake success, nothing stored); contact replies are persisted and email-gated; FAQ/StoreInfo CRUD is tidy; upload presign still the model citizen (allowlists, size cap, signed ContentLength); admin setup-status fine. Only note: 🔵 abandoned admin uploads (presigned but never attached to a record) accumulate in R2 — harmless, revisit if storage cost ever registers.

---

## Round-2 appendix — priorities in one line each

**Status (2026-07-06): all Round-2 findings resolved** except R2-C4, deliberately deferred.

**Fixed this week:** R2-C1 (confirm CAS), R2-C2 (don't cancel on payment.failed), R2-A1 (reset unlocks auto-lock). ✅
**Fixed this month:** R2-O3 (COD payment semantics), R2-O2 (orphan COD orders), R2-O1 (payment-status guard), R2-U1 (revoke sessions on password change), R2-A2 (lockout auto-expiry), R2-P1 (delete images after DB write), R2-C3 (webhook event guard), R2-PM1 (COD cap). ✅
**All 🔵 lows fixed** (C5, AD1, CA1, P2, P3, CP1, CP2, CP3, O4, R1). ✅
**Deferred:** R2-C4 (money stored as Float) — pragmatic guard in place (coupon discounts rounded to whole rupees so all stored amounts stay integral); full migration to integer paise / Decimal to be done alongside the next schema migration.
