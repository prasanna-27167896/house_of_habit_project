import * as reviewRepo from "@repos/review.repo";
import * as productRepo from "@repos/product.repo";
import * as userRepo from "@repos/user.repo";
import { Errors } from "@errors/index";
import { sendReviewReplyEmail } from "@utils/email";
import type { ReviewWithRelations, ReviewListResult } from "@interfaces/review.types";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  CreateReplyInput,
  ReviewListQuery,
} from "@validators/review.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createReview = async (
  userId: string,
  productId: string,
  input: CreateReviewInput,
): Promise<ReviewWithRelations> => {
  const product = await productRepo.findVisibleProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  // Verified purchase — only buyers can review.
  const purchased = await reviewRepo.hasPurchasedProduct(userId, productId);
  if (!purchased) throw Errors.REVIEW_NOT_PURCHASED();

  const existing = await reviewRepo.findReviewByUserAndProduct(userId, productId);
  if (existing) throw Errors.ALREADY_REVIEWED();

  const review = await reviewRepo.createReview({
    userId,
    productId,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body ?? null,
  });

  await reviewRepo.recalcProductRating(productId);

  return review;
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  input: UpdateReviewInput,
): Promise<ReviewWithRelations> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();
  if (review.userId !== userId) throw Errors.REVIEW_NOT_OWNED();

  const updated = await reviewRepo.updateReview(reviewId, {
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.body !== undefined ? { body: input.body } : {}),
  });

  await reviewRepo.recalcProductRating(review.productId);

  return updated;
};

export const deleteOwnReview = async (userId: string, reviewId: string): Promise<void> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();
  if (review.userId !== userId) throw Errors.REVIEW_NOT_OWNED();

  const productId = review.productId;
  await reviewRepo.deleteReview(reviewId);
  await reviewRepo.recalcProductRating(productId);
};

export const getProductReviews = async (
  productId: string,
  query: ReviewListQuery,
): Promise<ReviewListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [reviews, total] = await Promise.all([
    reviewRepo.findReviewsByProduct(productId, skip, query.limit),
    reviewRepo.countReviewsByProduct(productId),
  ]);
  return { reviews, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllReviews = async (query: ReviewListQuery): Promise<ReviewListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [reviews, total] = await Promise.all([
    reviewRepo.findAllReviews(skip, query.limit),
    reviewRepo.countAllReviews(),
  ]);
  return { reviews, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminGetPendingReplyReviews = (): Promise<ReviewWithRelations[]> =>
  reviewRepo.findPendingReplyReviews();

export const adminDeleteReview = async (reviewId: string): Promise<void> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();

  const productId = review.productId;
  await reviewRepo.deleteReview(reviewId);
  await reviewRepo.recalcProductRating(productId);
};

export const adminCreateReply = async (
  reviewId: string,
  input: CreateReplyInput,
): Promise<ReviewWithRelations> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();
  if (review.hasAdminReply) throw Errors.REPLY_ALREADY_EXISTS();

  // Insert the reply and set the flag atomically — no half-written state on a crash.
  await reviewRepo.createReplyWithFlag(reviewId, input.replyText);

  // Notify reviewer by email (fire-and-forget)
  const reviewer = await userRepo.findUserById(review.userId);
  if (reviewer) {
    sendReviewReplyEmail(
      reviewer.email,
      reviewer.fullName ?? "Customer",
      review.product.title,
      input.replyText,
    ).catch(() => undefined);
  }

  const updated = await reviewRepo.findReviewById(reviewId);
  return updated!;
};

export const adminUpdateReply = async (
  reviewId: string,
  input: CreateReplyInput,
): Promise<ReviewWithRelations> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();
  if (!review.reply) throw Errors.REPLY_NOT_FOUND();

  await reviewRepo.updateReply(review.reply.replyId, input.replyText);

  const updated = await reviewRepo.findReviewById(reviewId);
  return updated!;
};

export const adminDeleteReply = async (reviewId: string): Promise<ReviewWithRelations> => {
  const review = await reviewRepo.findReviewById(reviewId);
  if (!review) throw Errors.REVIEW_NOT_FOUND();
  if (!review.reply) throw Errors.REPLY_NOT_FOUND();

  await reviewRepo.deleteReply(review.reply.replyId);
  await reviewRepo.setHasAdminReply(reviewId, false);

  const updated = await reviewRepo.findReviewById(reviewId);
  return updated!;
};
