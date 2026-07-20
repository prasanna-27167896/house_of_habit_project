import swaggerJsdoc from "swagger-jsdoc";
import { env } from "@config/env";

// OpenAPI base document. Path operations are collected from the `@openapi` JSDoc
// blocks in the route files (see `apis` glob below). Reusable request/response
// shapes live here in components so the per-route annotations stay short.
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "HoH — House of Habit API",
      version: "1.0.0",
      description:
        "E-commerce backend API.\n\n" +
        "**Auth:** call `POST /auth/login`, copy the `accessToken` from the response, " +
        "click **Authorize** (top right), paste it, and every 🔒 endpoint becomes testable.\n\n" +
        "The refresh token is set as an httpOnly cookie automatically — you never handle it manually.",
    },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: "Local" }],
    tags: [
      { name: "Auth", description: "Registration (OTP), login, refresh, logout" },
      { name: "Forgot Password", description: "Password reset via OTP" },
      { name: "User", description: "Own profile" },
      { name: "Admin · Users", description: "User management (admin)" },
      { name: "Categories", description: "Product categories" },
      { name: "Brands", description: "Brands" },
      { name: "Products", description: "Products & variants" },
      { name: "Wishlist", description: "Customer wishlist" },
      { name: "Cart", description: "Shopping cart" },
      { name: "Addresses", description: "Shipping addresses" },
      { name: "Coupons", description: "Discount coupons" },
      { name: "Orders", description: "Orders (customer + admin)" },
      { name: "Payments", description: "Razorpay + COD checkout" },
      { name: "Reviews", description: "Product ratings, reviews & admin replies" },
      { name: "Contact", description: "Contact-us messages" },
      { name: "Feedback", description: "Customer feedback" },
      { name: "FAQs", description: "FAQs" },
      { name: "Store Info", description: "Store settings (shipping, contact)" },
      { name: "Upload", description: "Cloudflare R2 presigned uploads" },
      { name: "Admin", description: "Admin setup status" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the `accessToken` returned by /auth/login.",
        },
      },
      responses: {
        Success: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { success: { type: "boolean", example: true }, data: {} },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                message: "Invalid email address",
                code: "VALIDATION_ERROR",
                errors: { email: "Invalid email address" },
              },
            },
          },
        },
        Unauthorized: {
          description: "Missing/invalid token or session",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "No token provided.", code: "UNAUTHORIZED" },
            },
          },
        },
        Forbidden: {
          description: "Authenticated but not permitted (e.g. non-admin)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Access denied.", code: "FORBIDDEN" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { success: false, message: "Resource not found.", code: "NOT_FOUND" },
            },
          },
        },
      },
      schemas: {
        // ── Generic ────────────────────────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            code: { type: "string" },
            errors: { type: "object", additionalProperties: { type: "string" }, nullable: true },
          },
        },

        // ── Auth ───────────────────────────────────────────────────────────────
        RegisterInput: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: { type: "string", minLength: 2, example: "Jane Doe" },
            email: { type: "string", format: "email", example: "jane@example.com" },
            password: {
              type: "string",
              minLength: 8,
              description: "≥8 chars, ≥1 uppercase, ≥1 number",
              example: "Passw0rd",
            },
            mobile: { type: "string", example: "9000000000" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@hoh.com" },
            password: { type: "string", example: "User@1234" },
          },
        },
        OtpInput: {
          type: "object",
          required: ["otp"],
          properties: { otp: { type: "integer", example: 1234, minimum: 1000, maximum: 9999 } },
        },
        ForgotMailInput: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email", example: "user@hoh.com" } },
        },
        ChangePasswordInput: {
          type: "object",
          required: ["otp", "newPassword"],
          properties: {
            otp: { type: "integer", example: 1234 },
            newPassword: { type: "string", minLength: 8, example: "NewPass1" },
          },
        },
        UpdateProfileInput: {
          type: "object",
          properties: {
            fullName: { type: "string", example: "Jane Doe" },
            mobile: { type: "string", example: "9000000000" },
            dateOfBirth: { type: "string", format: "date", example: "1995-06-15" },
          },
        },
        ChangeOwnPasswordInput: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", example: "User@1234" },
            newPassword: { type: "string", minLength: 8, example: "NewPass1" },
          },
        },

        // ── Category / Brand ─────────────────────────────────────────────────────
        CreateCategoryInput: {
          type: "object",
          required: ["categoryTitle"],
          properties: {
            categoryTitle: { type: "string", example: "Sarees" },
            categoryDescription: { type: "string", example: "Handloom sarees" },
            imageUrl: { type: "string", format: "uri" },
            imageKey: { type: "string" },
          },
        },
        CreateBrandInput: {
          type: "object",
          required: ["brandName"],
          properties: {
            brandName: { type: "string", example: "Weaves & Co" },
            brandCode: { type: "string", example: "WVC" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
            categoryId: { type: "string", format: "uuid" },
            imageUrl: { type: "string", format: "uri" },
            imageKey: { type: "string" },
          },
        },

        // ── Product / Variant ────────────────────────────────────────────────────
        VariantInput: {
          type: "object",
          required: ["size", "color", "sku"],
          properties: {
            size: { type: "string", example: "M" },
            color: { type: "string", example: "Indigo" },
            colorCode: { type: "string", example: "#3f51b5" },
            sku: { type: "string", example: "SAR-IND-M-001" },
            stock: { type: "integer", example: 20 },
            price: { type: "integer", description: "Overrides product price when set", example: 1499 },
            isActive: { type: "boolean", example: true },
          },
        },
        CreateProductInput: {
          type: "object",
          required: ["title", "price", "discountedPrice", "categoryId"],
          properties: {
            title: { type: "string", example: "Handloom Cotton Saree" },
            description: { type: "string" },
            longDescription: { type: "string" },
            price: { type: "integer", example: 1999 },
            discountedPrice: { type: "integer", example: 1499 },
            gender: { type: "string", enum: ["MEN", "WOMEN", "UNISEX", "KIDS"] },
            fitType: { type: "string", enum: ["SLIM", "REGULAR", "LOOSE", "OVERSIZED"] },
            season: { type: "string", enum: ["SUMMER", "WINTER", "MONSOON", "ALL_SEASON"] },
            material: { type: "string" },
            occasion: { type: "string" },
            pattern: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            imageKey: { type: "string" },
            returnPolicy: { type: "string" },
            categoryId: { type: "string", format: "uuid" },
            brandId: { type: "string", format: "uuid" },
            variants: { type: "array", items: { $ref: "#/components/schemas/VariantInput" } },
          },
        },

        // ── Cart / Wishlist / Address ────────────────────────────────────────────
        AddToCartInput: {
          type: "object",
          required: ["variantId"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1, example: 1 },
          },
        },
        UpdateCartItemInput: {
          type: "object",
          required: ["quantity"],
          properties: { quantity: { type: "integer", minimum: 1, example: 2 } },
        },
        CreateAddressInput: {
          type: "object",
          required: ["fullName", "phone", "addressLine1", "city", "state", "pincode"],
          properties: {
            fullName: { type: "string", example: "Jane Doe" },
            phone: { type: "string", example: "9000000000" },
            addressLine1: { type: "string", example: "12 Weavers Lane" },
            addressLine2: { type: "string", example: "Near Temple" },
            city: { type: "string", example: "Chennai" },
            state: { type: "string", example: "Tamil Nadu" },
            pincode: { type: "string", example: "600001" },
            country: { type: "string", example: "India" },
            addressType: { type: "string", enum: ["HOME", "WORK", "OTHER"], example: "HOME" },
            isDefault: { type: "boolean", example: true },
          },
        },

        // ── Coupon ───────────────────────────────────────────────────────────────
        CreateCouponInput: {
          type: "object",
          required: ["couponCode", "couponType", "value"],
          properties: {
            couponCode: { type: "string", example: "FESTIVE20" },
            couponType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
            couponScope: { type: "string", enum: ["CART", "CATEGORY", "PRODUCT"], example: "CART" },
            value: { type: "number", example: 20 },
            minOrderValue: { type: "number", example: 999 },
            maxDiscount: { type: "number", example: 500 },
            isActive: { type: "boolean", example: true },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            usageLimit: { type: "integer", example: 100, description: "Total redemptions (null = unlimited)" },
            perUserLimit: { type: "integer", example: 1, description: "Redemptions per customer (null = unlimited)" },
            categoryId: { type: "string", format: "uuid" },
            productId: { type: "string", format: "uuid" },
          },
        },

        // ── Order / Payment ──────────────────────────────────────────────────────
        UpdateOrderStatusInput: {
          type: "object",
          required: ["orderStatus"],
          properties: {
            orderStatus: {
              type: "string",
              enum: [
                "PENDING", "ORDER_PLACED", "CONFIRMED", "PROCESSING", "SHIPPED",
                "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURN_REQUESTED",
                "RETURNED", "RETURN_REJECTED",
              ],
            },
          },
        },
        UpdatePaymentStatusInput: {
          type: "object",
          required: ["paymentStatus"],
          properties: {
            paymentStatus: {
              type: "string",
              enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
            },
          },
        },
        CheckoutInput: {
          type: "object",
          properties: {
            addressId: {
              type: "string",
              format: "uuid",
              description: "Optional — falls back to the user's default address when omitted",
            },
            couponCode: { type: "string", example: "FESTIVE20" },
          },
        },
        VerifyPaymentInput: {
          type: "object",
          required: ["orderId", "razorpayPaymentId", "razorpayOrderId", "razorpaySignature"],
          properties: {
            orderId: { type: "string", format: "uuid" },
            razorpayPaymentId: { type: "string", example: "pay_XXXXXXXX" },
            razorpayOrderId: { type: "string", example: "order_XXXXXXXX" },
            razorpaySignature: { type: "string" },
          },
        },

        // ── Review ───────────────────────────────────────────────────────────────
        CreateReviewInput: {
          type: "object",
          required: ["rating"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            title: { type: "string", example: "Lovely fabric" },
            body: { type: "string", example: "Soft and true to colour." },
          },
        },
        ReplyInput: {
          type: "object",
          required: ["replyText"],
          properties: { replyText: { type: "string", example: "Thank you for your feedback!" } },
        },

        // ── Contact / Feedback ───────────────────────────────────────────────────
        SubmitContactInput: {
          type: "object",
          required: ["name", "email", "subject", "message"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            subject: { type: "string", example: "Order query" },
            message: { type: "string", example: "When will my order ship?" },
            website: { type: "string", description: "Honeypot — render hidden, leave empty (bot trap)" },
          },
        },
        ReplyContactInput: {
          type: "object",
          required: ["replyMessage"],
          properties: { replyMessage: { type: "string", example: "It ships tomorrow." } },
        },
        SubmitFeedbackInput: {
          type: "object",
          required: ["name", "rating", "message"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            category: { type: "string" },
            message: { type: "string" },
            website: { type: "string", description: "Honeypot — render hidden, leave empty (bot trap)" },
          },
        },

        // ── FAQ / Store Info ─────────────────────────────────────────────────────
        CreateFaqInput: {
          type: "object",
          required: ["question", "answer"],
          properties: {
            question: { type: "string", example: "What is your return policy?" },
            answer: { type: "string", example: "Returns within 7 days." },
            isActive: { type: "boolean" },
            displayOrder: { type: "integer" },
          },
        },
        UpsertStoreInfoInput: {
          type: "object",
          required: ["storeName"],
          properties: {
            storeName: { type: "string", example: "House of Handloom" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            addressLine1: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            pincode: { type: "string" },
            country: { type: "string" },
            shippingCharge: { type: "number", example: 49 },
            freeShippingAbove: { type: "number", example: 999 },
          },
        },

        // ── Upload ───────────────────────────────────────────────────────────────
        PresignInput: {
          type: "object",
          required: ["folder", "contentType", "fileSize"],
          properties: {
            folder: { type: "string", enum: ["categories", "brands", "products"] },
            contentType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] },
            fileSize: { type: "integer", maximum: 5242880, example: 204800 },
          },
        },
      },
    },
  },
  // Route files carry the per-operation @openapi annotations.
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
