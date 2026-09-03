import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as returnService from "@services/return.service";
import { createReturnSchema, updateReturnStatusSchema, returnListQuerySchema } from "@validators/return.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createReturnRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const input = createReturnSchema.parse(req.body);
  const returnRequest = await returnService.createReturnRequest(userId, orderId, input);
  sendSuccess(res, returnRequest, 201);
});

export const getReturnsForOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const returns = await returnService.getReturnsForOrder(userId, orderId);
  sendSuccess(res, returns);
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllReturns = asyncHandler(async (req: Request, res: Response) => {
  const query = returnListQuerySchema.parse(req.query);
  const result = await returnService.adminGetAllReturns(query);
  sendSuccess(res, result);
});

export const adminUpdateReturnStatus = asyncHandler(async (req: Request, res: Response) => {
  const returnId = req.params["returnId"] as string;
  const input = updateReturnStatusSchema.parse(req.body);
  const returnRequest = await returnService.adminUpdateReturnStatus(returnId, input);
  sendSuccess(res, returnRequest);
});
