import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as exchangeService from "@services/exchange.service";
import { createExchangeSchema, updateExchangeStatusSchema, exchangeListQuerySchema } from "@validators/exchange.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createExchangeRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const input = createExchangeSchema.parse(req.body);
  const exchangeRequest = await exchangeService.createExchangeRequest(userId, orderId, input);
  sendSuccess(res, exchangeRequest, 201);
});

export const getExchangesForOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const exchanges = await exchangeService.getExchangesForOrder(userId, orderId);
  sendSuccess(res, exchanges);
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllExchanges = asyncHandler(async (req: Request, res: Response) => {
  const query = exchangeListQuerySchema.parse(req.query);
  const result = await exchangeService.adminGetAllExchanges(query);
  sendSuccess(res, result);
});

export const adminUpdateExchangeStatus = asyncHandler(async (req: Request, res: Response) => {
  const exchangeId = req.params["exchangeId"] as string;
  const input = updateExchangeStatusSchema.parse(req.body);
  const exchangeRequest = await exchangeService.adminUpdateExchangeStatus(exchangeId, input);
  sendSuccess(res, exchangeRequest);
});
