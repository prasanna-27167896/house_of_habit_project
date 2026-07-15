import type { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/AppError";

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied.", 403, "FORBIDDEN"));
    }
    next();
  };
