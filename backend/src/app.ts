import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "@config/env";
import { logger } from "@utils/logger";
import { errorMiddleware } from "@middleware/error.middleware";

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);

// ── Razorpay webhook — raw body MUST be registered before express.json() ─────
// Razorpay signature validation requires the original Buffer, not parsed JSON.
import { webhookHandler } from "@controllers/payment.controller";
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler,
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ── API docs (Swagger UI) ───────────────────────────────────────────────────
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@config/swagger";
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "HoH API Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
);

// ── Request logging ───────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

app.set("trust proxy", 1);

// ── Rate limiters ─────────────────────────────────────────────────────────────
const isDev = env.NODE_ENV !== "production";

const RATE_LIMIT_RESPONSE = {
  success: false,
  message: "Too many requests, please try again later.",
  code: "RATE_LIMIT_EXCEEDED",
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_RESPONSE,
});

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_RESPONSE,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMIT_RESPONSE,
});

export const adaptiveLimiter: express.RequestHandler = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD")
    return readLimiter(req, res, next);
  return writeLimiter(req, res, next);
};

// ── Routes ────────────────────────────────────────────────────────────────────
import { authRouter, forgotRouter } from "@routes/auth.routes";
import { userRouter, adminUserRouter } from "@routes/user.routes";
import { uploadRouter } from "@routes/upload.routes";
import { categoryRouter } from "@routes/category.routes";
import { brandRouter } from "@routes/brand.routes";
import { productRouter } from "@routes/product.routes";
import { wishlistRouter } from "@routes/wishlist.routes";
import { cartRouter } from "@routes/cart.routes";
import { addressRouter } from "@routes/address.routes";
import { couponRouter } from "@routes/coupon.routes";
import { orderRouter } from "@routes/order.routes";
import { reviewRouter } from "@routes/review.routes";
import { contactRouter, feedbackRouter } from "@routes/contact.routes";
import { faqRouter, storeInfoRouter } from "@routes/faq.routes";
import { paymentRouter } from "@routes/payment.routes";
import { adminRouter } from "@routes/admin.routes";

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/forgotPassword", authLimiter, forgotRouter);
app.use("/api/v1/user", adaptiveLimiter, userRouter);
app.use("/api/v1/admin/users", adaptiveLimiter, adminUserRouter);
app.use("/api/v1/upload", writeLimiter, uploadRouter);
app.use("/api/v1/categories", adaptiveLimiter, categoryRouter);
app.use("/api/v1/brands", adaptiveLimiter, brandRouter);
app.use("/api/v1/products", adaptiveLimiter, productRouter);
app.use("/api/v1/wishlist", adaptiveLimiter, wishlistRouter);
app.use("/api/v1/cart", adaptiveLimiter, cartRouter);
app.use("/api/v1/addresses", adaptiveLimiter, addressRouter);
app.use("/api/v1/coupons", adaptiveLimiter, couponRouter);
app.use("/api/v1/orders", adaptiveLimiter, orderRouter);
app.use("/api/v1/reviews", adaptiveLimiter, reviewRouter);
app.use("/api/v1/contact", adaptiveLimiter, contactRouter);
app.use("/api/v1/feedback", adaptiveLimiter, feedbackRouter);
app.use("/api/v1/faqs", adaptiveLimiter, faqRouter);
app.use("/api/v1/store-info", adaptiveLimiter, storeInfoRouter);
app.use("/api/v1/payment", writeLimiter, paymentRouter);
app.use("/api/v1/admin", adaptiveLimiter, adminRouter);

export { authLimiter, readLimiter, writeLimiter };

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorMiddleware);

export default app;

// ── Server startup ────────────────────────────────────────────────────────────
import { startJobs, stopJobs } from "@config/boss";

if (require.main === module) {
  const PORT = Number(env.PORT) || 3000;

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT} [${env.NODE_ENV}]`);
  });

  // Background jobs (reservation sweep). Non-fatal if it fails to start.
  void startJobs().catch((err: unknown) => logger.error({ err }, "Failed to start background jobs"));

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down gracefully…");

    const forceExit = setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 15_000);
    forceExit.unref();

    void stopJobs().finally(() => {
      server.close(() => {
        logger.info("Shutdown complete");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
