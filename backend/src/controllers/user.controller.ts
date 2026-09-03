import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as userService from "@services/user.service";
import { updateProfileSchema, changeOwnPasswordSchema } from "@validators/user.schema";

// ── Customer ───────────────────────────────────────────────────────────────────

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.userId);
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(req.user!.userId, data);
  sendSuccess(res, user);
});

export const changeOwnPassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = changeOwnPasswordSchema.parse(req.body);
  await userService.changeOwnPassword(req.user!.userId, req.user!.sessionId, currentPassword, newPassword);
  sendSuccess(res, { message: "Password updated successfully." });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.user!.userId);
  sendSuccess(res, { message: "Account deleted successfully." });
});

// ── Admin ──────────────────────────────────────────────────────────────────────

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
  const result = await userService.getAllUsers(page, limit);
  sendSuccess(res, result);
});

export const toggleLock = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const result = await userService.toggleLock(req.user!.userId, userId);
  sendSuccess(res, result);
});
