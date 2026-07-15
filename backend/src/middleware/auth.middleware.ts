import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@utils/jwt";
import { AppError } from "@utils/AppError";
import * as authRepo from "@repos/auth.repo";

// Session-backed auth: verify the access token, then validate the session it points
// to on every request. Because the session is checked live, revoking it (logout,
// password change, admin action) locks the user out immediately — a signature-only
// check could not do that.
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("No token provided.", 401, "UNAUTHORIZED"));
  }

  try {
    const { userId, sessionId } = verifyAccessToken(authHeader.slice(7));

    // Single JOIN — session + user (with role) in one round trip.
    const session = await authRepo.findSessionWithUser(sessionId);
    if (!session || session.userId !== userId) {
      return next(
        new AppError(
          "Session invalid. Please log in again.",
          401,
          "SESSION_INVALID",
        ),
      );
    }
    if (session.revoked) {
      return next(
        new AppError(
          "Session revoked. Please log in again.",
          401,
          "SESSION_REVOKED",
        ),
      );
    }
    if (session.expiresAt < new Date()) {
      return next(
        new AppError(
          "Session expired. Please log in again.",
          401,
          "SESSION_EXPIRED",
        ),
      );
    }
    if (session.user.locked) {
      return next(new AppError("Account is locked.", 403, "ACCOUNT_LOCKED"));
    }

    // Role read live from the DB so an admin-side role change takes effect at once.
    const role = session.user.roles[0]?.role.roleName ?? "ROLE_USER";

    req.user = { userId, role, sessionId };
    next();
  } catch (err: unknown) {
    const name = (err as { name?: string }).name;
    if (name === "TokenExpiredError") {
      return next(
        new AppError("Access token expired.", 401, "ACCESS_TOKEN_EXPIRED"),
      );
    }
    if (name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401, "INVALID_TOKEN"));
    }
    if (name === "NotBeforeError") {
      return next(
        new AppError("Token not active yet.", 401, "TOKEN_NOT_ACTIVE"),
      );
    }
    return next(err);
  }
};
