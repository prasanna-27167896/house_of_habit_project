import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@utils/AppError";
import { logger } from "@utils/logger";
import { env } from "@config/env";

const isPrismaKnownError = (err: unknown): err is { code: string } =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  typeof (err as Record<string, unknown>)["code"] === "string";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, route: `${req.method} ${req.path}` }, err.message);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Zod validation failures — thrown by schema.parse() in controllers.
  // Return 400 with per-field messages instead of falling through to 500.
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "_";
      // keep the first message per field
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    // Top-level message = the first field's message, so a frontend toast that shows
    // `message` is immediately actionable; `errors` still carries the full per-field map.
    const firstMessage = err.issues[0]?.message ?? "Invalid request data.";
    logger.warn({ route: `${req.method} ${req.path}`, fields: Object.keys(fieldErrors) }, "Validation failed");
    res.status(400).json({
      success: false,
      message: firstMessage,
      code: "VALIDATION_ERROR",
      errors: fieldErrors,
    });
    return;
  }

  if (isPrismaKnownError(err)) {
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Resource not found.", code: "NOT_FOUND" });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ success: false, message: "A record with this value already exists.", code: "CONFLICT" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ success: false, message: "Referenced record does not exist.", code: "INVALID_REFERENCE" });
      return;
    }
  }

  const error = err instanceof Error ? err : new Error(String(err));

  logger.error({ err: error, route: `${req.method} ${req.path}` }, "Unhandled error");

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error." : error.message,
    code: "INTERNAL_SERVER_ERROR",
  });
};
