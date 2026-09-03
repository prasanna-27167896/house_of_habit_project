import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as trackingService from "@services/tracking.service";
import { addTrackingNoteSchema } from "@validators/tracking.schema";

export const getOrderTracking = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const orderId = req.params["orderId"] as string;
  const tracking = await trackingService.getOrderTracking(userId, orderId);
  sendSuccess(res, tracking);
});

export const adminAddTrackingNote = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const input = addTrackingNoteSchema.parse(req.body);
  const note = await trackingService.adminAddTrackingNote(orderId, input);
  sendSuccess(res, note, 201);
});
