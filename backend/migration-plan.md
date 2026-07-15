# HoH Backend — Implementation Plan (Clothing E-commerce)

> **Reference:** Java Spring Boot backend of Super Ruchi Foods (food e-commerce).
> **Building:** Express.js + TypeScript + PostgreSQL (Prisma) for HoH — a single clothing brand e-commerce store.
> **Platform type:** Single brand. No vendors. Two roles only: ADMIN and USER (customer).

---

## Project Overview

HoH is a single-brand clothing e-commerce backend. Customers browse clothing products, filter by size/color/gender/category, add specific variants (size + color) to cart, place orders, and pay online (Razorpay) or via COD. Admin manages the full catalog, orders, coupons, reviews, returns, and refunds.

**Key difference from food reference:** Clothing requires a `ProductVariant` model — every product has multiple size × color combinations, each with its own stock and SKU. Cart items and order items must reference a specific variant, not just a product.

---

## Roles & Access Levels

| Role | Description |
|------|-------------|
| `ROLE_ADMIN` | Full access. Manages products, orders, coupons, returns, refunds, users. |
| `ROLE_USER` | Customer. Browses, carts, wishlists, orders, reviews. |

- All `GET` public catalog endpoints are unauthenticated.
- Cart and wishlist support guest sessions via `sessionId`.
- On login/register, guest cart and wishlist transfer to user account.
- Account locking: 5 failed login attempts locks the account. Only admin can unlock.

---

## Clothing-Specific Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Stock / Inventory | SKU per size × color (`ProductVariant`) | Industry standard (Myntra, Ajio). Each size+color has its own SKU and stock count. |
| Shipping | Flat rate always | Fixed shipping fee on every order. Stored in `StoreInfo.shippingCharge`. |
| Product attributes | Full — gender, fit, fabric, care, season, pattern, occasion | All clothing-specific fields included on `Product`. |
| Coupons | Cart + Category + Product (all 3 scopes) | Flexible. A coupon can apply to the full cart, a specific category, or a specific product. |
| Address | No geo fields (lat/lng, distance) | Nationwide courier shipping — no hyperlocal delivery fee calculation. |
| Order snapshot | `size`, `color`, `productTitle`, `price` stored on `OrderItem` | Immutable order history even if product/variant is edited later. |

---

## Modules (implement in this order)

---

### Module 1 — Auth & Users

**Description:** JWT + refresh token auth for customers. OTP email verification before registration. Forgot password flow. Account locking after 5 failed attempts.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/sendVerificationOtp?email=` | Send OTP to email | Public |
| POST | `/api/v1/auth/verifyOtp/:email` | Verify OTP | Public |
| POST | `/api/v1/auth/register` | Register user. Transfers guest cart/wishlist if `sessionId` provided. | Public |
| POST | `/api/v1/auth/login` | Login. Returns `jwtToken`, `refreshToken`, `user`. Tracks failed attempts. | Public |
| POST | `/api/v1/auth/refresh` | Refresh JWT | Public |
| POST | `/api/v1/auth/logout` | Invalidate refresh token | USER |
| POST | `/api/v1/forgotPassword/verifyMail` | Send forgot-password OTP | Public |
| POST | `/api/v1/forgotPassword/verifyOtp/:email` | Verify forgot-password OTP | Public |
| POST | `/api/v1/forgotPassword/changePassword/:email` | Change password after OTP | Public |
| GET | `/api/v1/user/` | Get own profile | USER |
| PUT | `/api/v1/user/update` | Update own profile | USER |
| PUT | `/api/v1/user/upload-image` | Upload profile photo (Cloudflare R2) | USER |
| GET | `/api/v1/admin/users` | All users paginated | ADMIN |
| POST | `/api/v1/admin/users/lock/:userId` | Lock / unlock user | ADMIN |
| DELETE | `/api/v1/admin/users/:userId` | Delete user | ADMIN |
| POST | `/api/v1/admin/change-password` | Admin changes own password | ADMIN |

**Prisma Models:** `User`, `Role`, `UserRole`, `RefreshToken`, `EmailVerification`, `ForgotPassword`

---

### Module 2 — Categories & Brands

**Description:** Clothing taxonomy. Categories can be disabled (cascades to products). Brands linked to categories.

**Clothing categories (examples):** Tops, Bottoms, Dresses, Outerwear, Innerwear, Footwear, Accessories, Ethnic Wear, Activewear

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/categories/add` | Create category (with optional image) | ADMIN |
| PUT | `/api/v1/categories/:categoryId` | Update category | ADMIN |
| DELETE | `/api/v1/categories/:categoryId` | Soft delete category | ADMIN |
| PATCH | `/api/v1/categories/:categoryId/toggle` | Enable/disable category | ADMIN |
| GET | `/api/v1/categories` | All active categories | Public |
| GET | `/api/v1/categories/:categoryId` | Category by ID | Public |
| POST | `/api/v1/brands/add` | Create brand (with image) | ADMIN |
| PUT | `/api/v1/brands/:brandId` | Update brand | ADMIN |
| DELETE | `/api/v1/brands/:brandId` | Delete brand | ADMIN |
| GET | `/api/v1/brands` | All brands | Public |
| GET | `/api/v1/brands/:brandId` | Brand by ID | Public |
| GET | `/api/v1/brands/category/:categoryId` | Brands by category | Public |

**Prisma Models:** `Category`, `Brand`

---

### Module 3 — Products & Variants

**Description:** Core clothing catalog. Each product has base fields (name, description, images, price) plus clothing-specific attributes (gender, fit, fabric, season, pattern, occasion). Variants handle size × color combinations with individual stock and SKU. Admin manages products; customers browse with filter/search/sort.

**Clothing-specific fields on Product:**
- `gender`: MEN | WOMEN | KIDS | UNISEX
- `fit`: SLIM | REGULAR | LOOSE | OVERSIZED
- `season`: SUMMER | WINTER | MONSOON | ALL_SEASON | FESTIVE
- `pattern`: SOLID | STRIPED | PRINTED | CHECKERED | FLORAL | EMBROIDERED | GRAPHIC
- `occasion`: CASUAL | FORMAL | PARTY | ETHNIC | SPORTS | WEDDING
- `fabric`: free text (e.g., "100% Cotton", "Polyester blend")
- `careInstructions`: free text

**Admin Product Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/products/add` | Create product with images and clothing attributes | ADMIN |
| PUT | `/api/v1/products/:productId` | Update product | ADMIN |
| DELETE | `/api/v1/products/:productId` | Soft delete product | ADMIN |
| PATCH | `/api/v1/products/:productId/toggle` | Enable/disable product | ADMIN |

**Variant Endpoints (nested under product):**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/products/:productId/variants` | Add variant (size + color + stock + SKU) | ADMIN |
| PUT | `/api/v1/products/:productId/variants/:variantId` | Update variant stock/price | ADMIN |
| DELETE | `/api/v1/products/:productId/variants/:variantId` | Delete variant | ADMIN |
| GET | `/api/v1/products/:productId/variants` | All variants for a product | Public |

**Public Catalog Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/products` | All products paginated | Public |
| GET | `/api/v1/products/:productId` | Product by ID (includes variants) | Public |
| GET | `/api/v1/products/category/:categoryId` | Products by category (paginated) | Public |
| GET | `/api/v1/products/search?q=` | Keyword search | Public |
| GET | `/api/v1/products/filter?gender=&size=&color=&minPrice=&maxPrice=&brand=&fit=&season=&occasion=&minRating=` | Advanced filter | Public |
| GET | `/api/v1/products/sort?sortBy=price_asc\|price_desc\|newest\|popular` | Sort | Public |
| GET | `/api/v1/products/search-filter-sort` | Combined search + filter + sort (paginated) | Public |
| GET | `/api/v1/products/most-ordered` | Trending / most-ordered products | Public |
| GET | `/api/v1/products/grouped-by-category` | Products grouped by category | Public |

**Prisma Models:** `Product`, `ProductVariant`, `ProductDetail`

---

### Module 4 — Wishlist

**Description:** Customers can wishlist products. Guests use `sessionId`. On login, wishlist transfers to user account. Wishlist items reference a product (not a specific variant — variant is chosen at cart stage).

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/wishlist/:productId?sessionId=` | Add to wishlist | Public |
| GET | `/api/v1/wishlist?sessionId=` | Get wishlist | Public |
| DELETE | `/api/v1/wishlist/:productId?sessionId=` | Remove from wishlist | Public |

**Prisma Models:** `Wishlist`, `WishlistProduct`

---

### Module 5 — Cart

**Description:** Cart items reference a `ProductVariant` (not just a product) — this is mandatory for clothing so size and color are always captured. Guests use `sessionId`. On login, guest cart transfers to user account. Coupon can be applied at cart level.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/cart?sessionId=` | Get cart | Public |
| POST | `/api/v1/cart/add/:variantId?sessionId=` | Add variant to cart | Public |
| PUT | `/api/v1/cart/items/:cartItemId?sessionId=` | Update quantity | Public |
| DELETE | `/api/v1/cart/items/:cartItemId?sessionId=` | Remove item | Public |
| PUT | `/api/v1/cart/apply-coupon?couponCode=&sessionId=` | Apply coupon | Public |
| DELETE | `/api/v1/cart/remove-coupon?sessionId=` | Remove coupon | Public |

**Prisma Models:** `Cart`, `CartItem`

---

### Module 6 — Addresses

**Description:** Users save multiple shipping addresses. No geo-distance logic (clothing ships nationwide via courier — flat or weight-based shipping, not distance-based).

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/address` | Save new address | USER |
| GET | `/api/v1/address` | All addresses for current user | USER |
| GET | `/api/v1/address/:addressId` | Address by ID | USER |
| PUT | `/api/v1/address/:addressId` | Update address | USER |
| DELETE | `/api/v1/address/:addressId` | Delete address | USER |

**Prisma Models:** `Address`

---

### Module 7 — Coupons

**Description:** Flexible coupon system with 3 scopes — CART (entire order), CATEGORY (items in a specific category), PRODUCT (a specific product). Supports percentage or fixed discount, min order value, max discount cap, usage limits, and optional start/end dates.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/coupons` | Create coupon | ADMIN |
| PUT | `/api/v1/coupons/:couponCode` | Update coupon | ADMIN |
| DELETE | `/api/v1/coupons/:couponCode` | Delete coupon | ADMIN |
| GET | `/api/v1/coupons` | All coupons (paginated) | ADMIN |
| GET | `/api/v1/coupons/:couponCode` | Get coupon by code (validate) | Public |

**Prisma Models:** `Coupon`

---

### Module 8 — Orders

**Description:** Order creation snapshots the cart into order items. Each `OrderItem` captures `variantId`, `size`, `color`, `quantity`, and `price` at time of order (immutable history). Supports all-cart orders or single-item orders. Customers can cancel. Admin manages order lifecycle.

**Customer Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/orders` | Place order (entire cart) | USER |
| POST | `/api/v1/orders/single/:cartItemId` | Place order for single cart item | USER |
| GET | `/api/v1/orders` | Current user's orders | USER |
| GET | `/api/v1/orders/:orderId` | Order detail | USER |
| PUT | `/api/v1/orders/:orderId/cancel` | Cancel order | USER |
| PUT | `/api/v1/orders/:orderId/upload-proof` | Upload payment proof image | USER |

**Admin Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/admin/orders` | All orders (paginated) | ADMIN |
| GET | `/api/v1/admin/orders/all` | All orders (no pagination) | ADMIN |
| GET | `/api/v1/admin/orders/:orderId` | Order by ID | ADMIN |
| GET | `/api/v1/admin/orders/status/:status` | Orders by status | ADMIN |
| GET | `/api/v1/admin/orders/user/:userId` | Orders by user | ADMIN |
| PUT | `/api/v1/admin/orders/:orderId/status` | Update order status | ADMIN |
| PUT | `/api/v1/admin/orders/:orderId/payment-status` | Update payment status | ADMIN |
| DELETE | `/api/v1/admin/orders/:orderId` | Delete order | ADMIN |
| GET | `/api/v1/admin/orders/stats` | Order stats (dashboard) | ADMIN |
| GET | `/api/v1/admin/orders/monthly-counts?year=` | Monthly order counts | ADMIN |

**Order Status State Machine:**
```
PENDING → ORDER_PLACED → CONFIRMED → PROCESSING → SHIPPED → IN_TRANSIT → DELIVERED
Any state → CANCELLED
DELIVERED → RETURN_REQUESTED → RETURNED | RETURN_REJECTED
```

**Prisma Models:** `Order`, `OrderItem`

---

### Module 9 — Payments (Razorpay)

**Description:** Razorpay integration for web and mobile. COD supported. After successful payment, cart clears and admin notification fires.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/payment/:orderId` | Create Razorpay payment link (web) | USER |
| GET | `/api/v1/payment/callback?razorpay_payment_id=&orderId=` | Web payment callback (redirect) | Public |
| POST | `/api/v1/payment/mobile/:orderId` | Create Razorpay order (mobile SDK) | USER |
| GET | `/api/v1/payment/mobile/callback?razorpay_payment_id=&orderId=` | Mobile callback (JSON) | Public |
| GET | `/api/v1/payment/cod/:orderId` | Mark order as COD | USER |

**Prisma Models:** updates `Order` payment fields only

**Docs required for payemnt integration**
1. Prerequisites : https://razorpay.com/docs/payments/server-integration/nodejs/
2. github API Sample codes: https://github.com/razorpay/razorpay-node/tree/master/documents
3. Integration steps : https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/

---

### Module 10 — Ratings, Reviews & Replies

**Description:** Customers review products they've purchased. Admin can reply to reviews. Review on a product updates `numRatings` and `totalReviews` on the product.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/reviews/:productId` | Create review (with rating 1–5) | USER |
| GET | `/api/v1/reviews/:productId` | All reviews for a product | Public |
| GET | `/api/v1/reviews` | All reviews (admin) | ADMIN |
| DELETE | `/api/v1/reviews/:reviewId` | Delete review | ADMIN |
| POST | `/api/v1/reviews/:reviewId/reply` | Admin replies to review | ADMIN |
| GET | `/api/v1/reviews/:reviewId/replies` | Replies for a review | Public |

**Prisma Models:** `RatingReview`, `Reply`

---

### Module 11 — Returns & Refunds

**Description:** Customer requests return on a delivered order. Admin approves or rejects. Refund processed via Razorpay (or manual for COD).

**Return Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/returns/request/:orderId` | Request return | USER |
| GET | `/api/v1/returns` | All returns (paginated, with status filter) | ADMIN |
| GET | `/api/v1/returns/:returnId` | Return by ID | ADMIN |
| PUT | `/api/v1/returns/:returnId/approve` | Approve return | ADMIN |
| PUT | `/api/v1/returns/:returnId/reject` | Reject return with reason | ADMIN |
| GET | `/api/v1/returns/counts` | Return count summary | ADMIN |

**Refund Endpoints:**

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/refunds/:orderId` | Process refund (Razorpay) | ADMIN |
| GET | `/api/v1/refunds` | All refunds | ADMIN |
| GET | `/api/v1/refunds/:refundId` | Refund by ID | ADMIN |
| GET | `/api/v1/refunds/summary` | Refund summary stats | ADMIN |

**Prisma Models:** `ReturnRequest`, `PaymentRefund`

---

### Module 12 — Admin Notifications

**Description:** Admin receives real-time notifications on new orders and new reviews. WebSocket (`socket.io`) for live dashboard updates.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/admin/notifications` | Notification counts (orders + reviews) | ADMIN |
| PUT | `/api/v1/admin/notifications/mark-read` | Mark all as read | ADMIN |

**Prisma Models:** `Notification`

---

### Module 13 — Feedback & Contact

**Description:** Customers can submit general feedback (rating + message). Contact-us form with admin reply.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/feedback` | Submit feedback | Public |
| GET | `/api/v1/feedback` | All feedback | ADMIN |
| DELETE | `/api/v1/feedback/:feedbackId` | Delete feedback | ADMIN |
| POST | `/api/v1/contact-us` | Submit contact-us | Public |
| POST | `/api/v1/contact-us/:contactId/reply` | Admin replies | ADMIN |
| GET | `/api/v1/contact-us` | All contact submissions | ADMIN |

**Prisma Models:** `Feedback`, `ContactUs`

---

### Module 14 — FAQs & Store Info

**Description:** Admin manages FAQ content. Store info holds brand address, contact, and social links.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/faqs` | Create FAQ | ADMIN |
| PUT | `/api/v1/faqs/:faqId` | Update FAQ | ADMIN |
| DELETE | `/api/v1/faqs/:faqId` | Delete FAQ | ADMIN |
| GET | `/api/v1/faqs` | All FAQs | Public |
| POST | `/api/v1/store-info` | Create store info | ADMIN |
| PUT | `/api/v1/store-info/:storeInfoId` | Update store info | ADMIN |
| GET | `/api/v1/store-info` | Get store info | Public |

**Prisma Models:** `Faq`, `StoreInfo`

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────────────────────────

enum OrderStatus {
  PENDING
  ORDER_PLACED
  CONFIRMED
  PROCESSING
  SHIPPED
  IN_TRANSIT
  DELIVERED
  CANCELLED
  RETURN_REQUESTED
  RETURNED
  RETURN_REJECTED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

enum ReturnStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

enum AddressType {
  HOME
  WORK
  OTHER
}

enum Gender {
  MEN
  WOMEN
  KIDS
  UNISEX
}

enum Fit {
  SLIM
  REGULAR
  LOOSE
  OVERSIZED
}

enum Season {
  SUMMER
  WINTER
  MONSOON
  ALL_SEASON
  FESTIVE
}

enum Pattern {
  SOLID
  STRIPED
  PRINTED
  CHECKERED
  FLORAL
  EMBROIDERED
  GRAPHIC
  ABSTRACT
}

enum Occasion {
  CASUAL
  FORMAL
  PARTY
  ETHNIC
  SPORTS
  WEDDING
}

enum Size {
  XS
  S
  M
  L
  XL
  XXL
  XXXL
  FREE_SIZE
}

enum CouponType {
  PERCENTAGE
  FIXED
}

enum CouponScope {
  CART
  CATEGORY
  PRODUCT
}

// ─── AUTH & USERS ────────────────────────────────────────────────────────────

model User {
  userId              Int       @id @default(autoincrement())
  fullName            String?
  password            String
  email               String    @unique
  mobile              String?
  dateOfBirth         DateTime?
  imageUrl            String?
  locked              Boolean   @default(false)
  failedLoginAttempts Int       @default(0)
  accountLockedAt     DateTime?
  createdAt           DateTime  @default(now())

  roles          UserRole[]
  addresses      Address[]
  refreshToken   RefreshToken?
  forgotPassword ForgotPassword?
  reviews        RatingReview[]
  wishlist       Wishlist?
  cart           Cart?
  orders         Order[]
  replies        Reply[]

  @@map("users")
}

model Role {
  roleId   Int    @id
  roleName String @unique

  userRoles UserRole[]

  @@map("roles")
}

model UserRole {
  userId Int
  roleId Int

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [roleId], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

model RefreshToken {
  tokenId      Int      @id @default(autoincrement())
  refreshToken String   @unique
  expiryDate   DateTime
  userId       Int      @unique

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@map("refresh_tokens")
}

model EmailVerification {
  verificationId Int      @id @default(autoincrement())
  email          String   @unique
  otp            Int
  isVerified     Boolean  @default(false)
  expiresAt      DateTime
  createdAt      DateTime @default(now())

  @@map("email_verifications")
}

model ForgotPassword {
  fpId      Int      @id @default(autoincrement())
  otp       Int
  expiresAt DateTime
  userId    Int      @unique

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@map("forgot_passwords")
}

// ─── CATEGORIES & BRANDS ─────────────────────────────────────────────────────

model Category {
  categoryId          Int      @id @default(autoincrement())
  categoryTitle       String   @unique
  categoryDescription String?
  imageUrl            String?
  isDisabled          Boolean  @default(false)
  isDeleted           Boolean  @default(false)
  createdAt           DateTime @default(now())

  products Product[]
  brands   Brand[]
  coupons  Coupon[]

  @@map("categories")
}

model Brand {
  brandId    Int      @id @default(autoincrement())
  brandName  String
  brandCode  String?
  imageUrl   String?
  categoryId Int?
  createdAt  DateTime @default(now())

  category Category? @relation(fields: [categoryId], references: [categoryId])
  products Product[]

  @@map("brands")
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

model Product {
  productId          Int       @id @default(autoincrement())
  title              String
  description        String?
  longDescription    String?   @db.Text
  price              Float
  discountedPrice    Float
  discountPercentage Int?
  gender             Gender?
  fit                Fit?
  season             Season?
  pattern            Pattern?
  occasion           Occasion?
  fabric             String?
  careInstructions   String?
  returnPolicy       String?
  imageUrl           String?
  imageUrl1          String?
  imageUrl2          String?
  imageUrl3          String?
  isDisabled         Boolean   @default(false)
  isDeleted          Boolean   @default(false)
  numRatings         Float     @default(0)
  totalReviews       Int       @default(0)
  categoryId         Int?
  brandId            Int?
  createdAt          DateTime  @default(now())

  category         Category?        @relation(fields: [categoryId], references: [categoryId])
  brand            Brand?           @relation(fields: [brandId], references: [brandId])
  variants         ProductVariant[]
  reviews          RatingReview[]
  coupons          Coupon[]
  wishlistProducts WishlistProduct[]
  replies          Reply[]

  @@map("products")
}

// Critical for clothing — each size+color combo is a separate variant with its own stock
model ProductVariant {
  variantId       Int     @id @default(autoincrement())
  productId       Int
  size            Size
  color           String
  colorHex        String?
  sku             String  @unique
  stock           Int     @default(0)
  price           Float?  // if null, inherits product.discountedPrice
  imageUrl        String? // variant-specific image (e.g. color swatch)
  isActive        Boolean @default(true)

  product    Product     @relation(fields: [productId], references: [productId], onDelete: Cascade)
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@unique([productId, size, color])
  @@map("product_variants")
}

// ─── WISHLIST ────────────────────────────────────────────────────────────────

model Wishlist {
  wishlistId Int     @id @default(autoincrement())
  userId     Int?    @unique
  sessionId  String? @unique

  user     User?             @relation(fields: [userId], references: [userId], onDelete: Cascade)
  products WishlistProduct[]

  @@map("wishlists")
}

model WishlistProduct {
  wishlistId Int
  productId  Int

  wishlist Wishlist @relation(fields: [wishlistId], references: [wishlistId], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [productId], onDelete: Cascade)

  @@id([wishlistId, productId])
  @@map("wishlist_products")
}

// ─── CART ────────────────────────────────────────────────────────────────────

model Cart {
  cartId               Int     @id @default(autoincrement())
  userId               Int?    @unique
  sessionId            String? @unique
  totalPrice           Float   @default(0)
  totalItems           Int     @default(0)
  totalDiscountedPrice Float   @default(0)
  discount             Float   @default(0)
  couponCode           String?
  couponDiscount       Float?
  totalAfterCoupon     Float   @default(0)
  isCouponApplied      Boolean @default(false)

  user      User?      @relation(fields: [userId], references: [userId], onDelete: Cascade)
  cartItems CartItem[]

  @@map("carts")
}

model CartItem {
  cartItemId      Int    @id @default(autoincrement())
  cartId          Int
  variantId       Int
  quantity        Int
  price           Float
  discountedPrice Float

  cart    Cart           @relation(fields: [cartId], references: [cartId], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [variantId])

  @@unique([cartId, variantId])
  @@map("cart_items")
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

model Address {
  addressId   Int         @id @default(autoincrement())
  userId      Int
  firstName   String
  lastName    String?
  phone       String
  line1       String
  line2       String?
  city        String
  state       String
  pinCode     String
  country     String      @default("India")
  addressType AddressType @default(HOME)
  isDefault   Boolean     @default(false)
  createdAt   DateTime    @default(now())

  user   User    @relation(fields: [userId], references: [userId], onDelete: Cascade)
  orders Order[]

  @@map("addresses")
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────

model Coupon {
  couponId       Int         @id @default(autoincrement())
  couponCode     String      @unique
  couponType     CouponType
  couponScope    CouponScope @default(CART)
  value          Float
  minOrderValue  Float?
  maxDiscount    Float?      // cap for percentage coupons
  isActive       Boolean     @default(true)
  registeredOnly Boolean     @default(false)
  startDate      DateTime?
  endDate        DateTime?
  usageLimit     Int?        // total uses allowed
  usageCount     Int         @default(0)
  categoryId     Int?        // if scope is CATEGORY
  productId      Int?        // optional: restrict to specific product
  createdAt      DateTime    @default(now())

  category Category? @relation(fields: [categoryId], references: [categoryId])
  product  Product?  @relation(fields: [productId], references: [productId])

  @@map("coupons")
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

model Order {
  orderId              Int           @id @default(autoincrement())
  userId               Int
  shippingAddressId    Int
  orderStatus          OrderStatus   @default(PENDING)
  paymentStatus        PaymentStatus @default(PENDING)
  paymentMethod        String?       // RAZORPAY | COD | BANK_TRANSFER
  paymentId            String?       // Razorpay payment ID
  razorpayOrderId      String?
  razorpayPaymentLink  String?
  totalPrice           Float
  totalDiscountedPrice Float
  discount             Float
  couponCode           String?
  couponDiscount       Float?
  shippingCharge       Float         @default(0)
  totalAmount          Float         // final amount after all discounts + shipping
  totalItems           Int
  proofImageUrl        String?
  proofImageUrl1       String?
  estimatedDelivery    DateTime?
  deliveredAt          DateTime?
  createdAt            DateTime      @default(now())

  user            User           @relation(fields: [userId], references: [userId])
  shippingAddress Address        @relation(fields: [shippingAddressId], references: [addressId])
  orderItems      OrderItem[]
  returnRequest   ReturnRequest?
  paymentRefund   PaymentRefund?
  notification    Notification?

  @@map("orders")
}

model OrderItem {
  orderItemId     Int    @id @default(autoincrement())
  orderId         Int
  variantId       Int
  productTitle    String // snapshot at time of order
  size            String // snapshot
  color           String // snapshot
  imageUrl        String? // snapshot
  quantity        Int
  price           Float  // snapshot
  discountedPrice Float  // snapshot

  order   Order          @relation(fields: [orderId], references: [orderId], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [variantId])

  @@map("order_items")
}

// ─── REVIEWS & REPLIES ───────────────────────────────────────────────────────

model RatingReview {
  reviewId    Int      @id @default(autoincrement())
  userId      Int
  productId   Int
  rating      Int
  review      String?  @db.Text
  isRead      Boolean  @default(false)
  hasReply    Boolean  @default(false)
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [userId], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [productId], onDelete: Cascade)
  replies Reply[]

  @@unique([userId, productId])
  @@map("rating_reviews")
}

model Reply {
  replyId   Int      @id @default(autoincrement())
  reviewId  Int
  userId    Int
  productId Int
  replyText String   @db.Text
  createdAt DateTime @default(now())

  review  RatingReview @relation(fields: [reviewId], references: [reviewId], onDelete: Cascade)
  user    User         @relation(fields: [userId], references: [userId])
  product Product      @relation(fields: [productId], references: [productId])

  @@map("replies")
}

// ─── RETURNS & REFUNDS ───────────────────────────────────────────────────────

model ReturnRequest {
  returnId      Int          @id @default(autoincrement())
  orderId       Int          @unique
  reason        String
  status        ReturnStatus @default(PENDING)
  adminNote     String?
  createdAt     DateTime     @default(now())
  resolvedAt    DateTime?

  order Order @relation(fields: [orderId], references: [orderId])

  @@map("return_requests")
}

model PaymentRefund {
  refundId         Int       @id @default(autoincrement())
  orderId          Int       @unique
  refundAmount     Float
  razorpayRefundId String?
  paymentMethod    String?
  status           String    @default("PENDING")
  processedAt      DateTime?
  createdAt        DateTime  @default(now())

  order Order @relation(fields: [orderId], references: [orderId])

  @@map("payment_refunds")
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

model Notification {
  notificationId Int      @id @default(autoincrement())
  orderId        Int?     @unique
  type           String   // ORDER | REVIEW
  message        String
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())

  order Order? @relation(fields: [orderId], references: [orderId])

  @@map("notifications")
}

// ─── CONTENT & SUPPORT ───────────────────────────────────────────────────────

model Faq {
  faqId       Int      @id @default(autoincrement())
  question    String
  answer      String   @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@map("faqs")
}

model Feedback {
  feedbackId Int      @id @default(autoincrement())
  name       String?
  email      String?
  rating     Int
  message    String   @db.Text
  createdAt  DateTime @default(now())

  @@map("feedbacks")
}

model ContactUs {
  contactId   Int      @id @default(autoincrement())
  name        String
  email       String
  phone       String?
  subject     String?
  message     String   @db.Text
  isReplied   Boolean  @default(false)
  adminReply  String?  @db.Text
  repliedAt   DateTime?
  createdAt   DateTime @default(now())

  @@map("contact_us")
}

model StoreInfo {
  storeInfoId  Int      @id @default(autoincrement())
  storeName    String?
  email        String?
  phone        String?
  address      String?
  city         String?
  state        String?
  pinCode      String?
  country      String?
  website      String?
  instagram    String?
  facebook     String?
  twitter      String?
  description  String?  @db.Text
  createdAt    DateTime @default(now())

  @@map("store_info")
}
```

---

## Implementation Order

1. **Module 1 — Auth & Users**
   JWT + OTP foundation. Everything else requires authenticated users.

2. **Module 2 — Categories & Brands**
   Products depend on these. Must exist before any product is created.

3. **Module 3 — Products & Variants**
   Core catalog. Cart, wishlist, orders, reviews, coupons all depend on products and variants.

4. **Module 4 — Wishlist**
   Simple. Depends only on products and users. Build alongside cart.

5. **Module 5 — Cart**
   References `ProductVariant`. Guest cart (sessionId) logic lives here.

6. **Module 6 — Addresses**
   Required for order creation (shipping address is mandatory).

7. **Module 7 — Coupons**
   Cart applies coupons. Must exist before orders.

8. **Module 8 — Orders**
   Depends on cart, addresses, variants. Core business logic.

9. **Module 9 — Payments (Razorpay)**
   Layered on top of existing orders.

10. **Module 10 — Ratings, Reviews & Replies**
    Depends on products and users. Self-contained.

11. **Module 11 — Returns & Refunds**
    Depends on orders. Return → Refund flow.

12. **Module 12 — Admin Notifications**
    Depends on orders and reviews. Add WebSocket here.

13. **Module 13 — Feedback & Contact**
    Standalone support. No dependencies.

14. **Module 14 — FAQs & Store Info**
    Simple CRUD. Lowest priority.

---

## File / Folder Structure

```
HohBE/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # Seed roles (ROLE_ADMIN=501, ROLE_USER=502)
│
├── src/
│   ├── index.ts             # App entry — loads env, starts server
│   ├── app.ts               # Express setup, middleware registration, route mount
│   ├── server.ts            # HTTP + Socket.IO server
│   │
│   ├── config/
│   │   ├── env.ts           # Zod-validated env variables
│   │   ├── razorpay.ts      # Razorpay client singleton
│   │   ├── r2.ts            # Cloudflare R2 (S3-compatible) client
│   │   ├── mailer.ts        # Nodemailer transporter
│   │   └── socket.ts        # Socket.IO setup
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verify → attach req.user
│   │   ├── role.middleware.ts     # requireRole('ROLE_ADMIN') guard
│   │   ├── error.middleware.ts    # Global error handler
│   │   └── upload.middleware.ts   # Multer (multipart)
│   │
│   ├── utils/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── jwt.ts           # generateAccessToken, generateRefreshToken, verify
│   │   ├── bcrypt.ts        # hashPassword, comparePassword (with pepper)
│   │   ├── otp.ts           # generateOtp (6-digit)
│   │   ├── email.ts         # sendOtpEmail, sendContactReply, etc.
│   │   ├── r2.ts            # uploadToR2, deleteFromR2
│   │   ├── pagination.ts    # Generic take/skip/count helper
│   │   └── response.ts      # Standard { success, message, data } shape
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts      # Zod request validation
│   │   │
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.schema.ts
│   │   │
│   │   ├── category/
│   │   │   ├── category.routes.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.schema.ts
│   │   │
│   │   ├── brand/
│   │   │   ├── brand.routes.ts
│   │   │   ├── brand.controller.ts
│   │   │   ├── brand.service.ts
│   │   │   └── brand.schema.ts
│   │   │
│   │   ├── product/
│   │   │   ├── product.routes.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.schema.ts
│   │   │   ├── variant.controller.ts
│   │   │   └── variant.service.ts
│   │   │
│   │   ├── wishlist/
│   │   │   ├── wishlist.routes.ts
│   │   │   ├── wishlist.controller.ts
│   │   │   └── wishlist.service.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.schema.ts
│   │   │
│   │   ├── address/
│   │   │   ├── address.routes.ts
│   │   │   ├── address.controller.ts
│   │   │   ├── address.service.ts
│   │   │   └── address.schema.ts
│   │   │
│   │   ├── coupon/
│   │   │   ├── coupon.routes.ts
│   │   │   ├── coupon.controller.ts
│   │   │   ├── coupon.service.ts
│   │   │   └── coupon.schema.ts
│   │   │
│   │   ├── order/
│   │   │   ├── order.routes.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.schema.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.controller.ts
│   │   │   └── payment.service.ts
│   │   │
│   │   ├── review/
│   │   │   ├── review.routes.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   └── review.schema.ts
│   │   │
│   │   ├── return/
│   │   │   ├── return.routes.ts
│   │   │   ├── return.controller.ts
│   │   │   ├── return.service.ts
│   │   │   └── refund.service.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── notification.routes.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   ├── feedback/
│   │   │   ├── feedback.routes.ts
│   │   │   ├── feedback.controller.ts
│   │   │   └── feedback.service.ts
│   │   │
│   │   ├── contact/
│   │   │   ├── contact.routes.ts
│   │   │   ├── contact.controller.ts
│   │   │   └── contact.service.ts
│   │   │
│   │   ├── faq/
│   │   │   ├── faq.routes.ts
│   │   │   ├── faq.controller.ts
│   │   │   └── faq.service.ts
│   │   │
│   │   └── store-info/
│   │       ├── store-info.routes.ts
│   │       ├── store-info.controller.ts
│   │       └── store-info.service.ts
│   │
│   └── types/
│       ├── express.d.ts     # Augments req.user: { userId, role }
│       └── index.ts
│
├── .env
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── migration-plan.md
```

---

## Key Implementation Notes

### ProductVariant is the core difference
Every `CartItem` and `OrderItem` must reference a `variantId`. When customer adds to cart, they must have already selected size and color — the frontend sends `variantId`. This ensures stock is tracked per SKU, not per product.

### OrderItem snapshots
At order creation, copy `productTitle`, `size`, `color`, `imageUrl`, `price`, `discountedPrice` from the variant/product into `OrderItem`. This ensures order history is accurate even if the product is later edited or deleted.

### Guest Cart & Wishlist Transfer
On register/login, if `sessionId` is provided:
1. Find guest `Cart` by `sessionId`
2. Merge its items into the user's `Cart` (sum quantities for duplicate variants)
3. Delete the guest cart
4. Same logic for `Wishlist`

### Shipping Charge
No distance-based delivery fee (this is nationwide shipping, not hyperlocal food delivery). Flat rate or free-above-threshold logic. Store in `StoreInfo` as a config field or hardcode initially. `Order.shippingCharge` captures the value at order time.

### Coupon Design
Coupon applies at cart level. `CouponScope.CART` = applies to entire order. `CouponScope.CATEGORY` = applies only to items in the specified category. Apply coupon in `cart.service.ts` and recalculate `totalAfterCoupon`.

### Cloudflare R2 (not AWS S3)
The `.env` already uses Cloudflare R2 credentials. R2 is S3-compatible — use `@aws-sdk/client-s3` with a custom `endpoint` pointing to Cloudflare. Utility lives in `src/utils/r2.ts`.

### Password Pepper
`.env` already has `PASSWORD_PEPPER`. Apply pepper before bcrypt: `bcrypt.hash(password + pepper, 12)`. Never store the pepper in the DB.

### WebSocket (Admin Notifications)
Use `socket.io`. Admin dashboard connects and subscribes. Emit `new_order` and `new_review` events. Trigger on successful Razorpay payment capture and on new review creation.

### Account Lockout
After 5 failed login attempts → set `User.locked = true`, `User.accountLockedAt = now()`. Only ADMIN can unlock via `POST /api/v1/admin/users/lock/:userId`.
