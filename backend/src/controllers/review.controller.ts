import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as reviewService from "@services/review.service";
import {
  createReviewSchema,
  updateReviewSchema,
  createReplySchema,
  reviewListSchema,
} from "@validators/review.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const input = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.user!.userId, productId, input);
  sendSuccess(res, review, 201);
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  const input = updateReviewSchema.parse(req.body);
  const review = await reviewService.updateReview(req.user!.userId, reviewId, input);
  sendSuccess(res, review);
});

export const deleteOwnReview = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  await reviewService.deleteOwnReview(req.user!.userId, reviewId);
  sendSuccess(res, { message: "Review deleted successfully." });
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const query = reviewListSchema.parse(req.query);
  const result = await reviewService.getProductReviews(productId, query);
  sendSuccess(res, result);
});

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const query = reviewListSchema.parse(req.query);
  const result = await reviewService.adminGetAllReviews(query);
  sendSuccess(res, result);
});

export const adminGetPendingReplyReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await reviewService.adminGetPendingReplyReviews();
  sendSuccess(res, reviews);
});

export const adminDeleteReview = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  await reviewService.adminDeleteReview(reviewId);
  sendSuccess(res, { message: "Review deleted successfully." });
});

export const adminCreateReply = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  const input = createReplySchema.parse(req.body);
  const review = await reviewService.adminCreateReply(reviewId, input);
  sendSuccess(res, review, 201);
});

export const adminUpdateReply = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  const input = createReplySchema.parse(req.body);
  const review = await reviewService.adminUpdateReply(reviewId, input);
  sendSuccess(res, review);
});

export const adminDeleteReply = asyncHandler(async (req: Request, res: Response) => {
  const reviewId = req.params["reviewId"] as string;
  const review = await reviewService.adminDeleteReply(reviewId);
  sendSuccess(res, review);
});
