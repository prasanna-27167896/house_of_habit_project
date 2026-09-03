import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as deliveryFeedbackService from "@services/deliveryFeedback.service";
import {
  createDeliveryFeedbackSchema,
  deliveryFeedbackListQuerySchema,
} from "@validators/deliveryFeedback.schema";

export const createDeliveryFeedback = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const input = createDeliveryFeedbackSchema.parse(req.body);
  const feedback = await deliveryFeedbackService.createDeliveryFeedback(userId, orderId, input);
  sendSuccess(res, feedback, 201);
});

export const getDeliveryFeedbackForOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const feedback = await deliveryFeedbackService.getDeliveryFeedbackForOrder(userId, orderId);
  sendSuccess(res, feedback);
});

export const adminGetAllDeliveryFeedback = asyncHandler(async (req: Request, res: Response) => {
  const query = deliveryFeedbackListQuerySchema.parse(req.query);
  const result = await deliveryFeedbackService.adminGetAllDeliveryFeedback(query);
  sendSuccess(res, result);
});
