import { prisma } from "@lib/prisma";
import type { ReviewWithRelations, ReviewWriteData, ReviewUpdateData } from "@interfaces/review.types";

// ─── Shared include ───────────────────────────────────────────────────────────

const reviewInclude = {
  user: { select: { userId: true, fullName: true, imageUrl: true } },
  product: { select: { productId: true, title: true } },
  reply: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const findReviewById = (reviewId: string): Promise<ReviewWithRelations | null> =>
  prisma.review.findUnique({ where: { reviewId }, include: reviewInclude });

export const findReviewByUserAndProduct = (userId: string, productId: string): Promise<ReviewWithRelations | null> =>
  prisma.review.findUnique({ where: { userId_productId: { userId, productId } }, include: reviewInclude });

export const findReviewsByProduct = (
  productId: string,
  skip: number,
  take: number,
): Promise<ReviewWithRelations[]> =>
  prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: reviewInclude,
  });

export const countReviewsByProduct = (productId: string): Promise<number> =>
  prisma.review.count({ where: { productId } });

export const findAllReviews = (skip: number, take: number): Promise<ReviewWithRelations[]> =>
  prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: reviewInclude,
  });

export const countAllReviews = (): Promise<number> => prisma.review.count();

export const findPendingReplyReviews = (): Promise<ReviewWithRelations[]> =>
  prisma.review.findMany({
    where: { hasAdminReply: false },
    orderBy: { createdAt: "desc" },
    include: reviewInclude,
  });

export const findAllRatingsForProduct = (productId: string): Promise<{ rating: number }[]> =>
  prisma.review.findMany({ where: { productId }, select: { rating: true } });

// Verified-purchase check: the user has a paid, non-cancelled order containing
// any variant of this product.
export const hasPurchasedProduct = async (userId: string, productId: string): Promise<boolean> => {
  const count = await prisma.orderItem.count({
    where: {
      order: { userId, paymentStatus: "COMPLETED", orderStatus: { not: "CANCELLED" } },
      variant: { productId },
    },
  });
  return count > 0;
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const createReview = (data: ReviewWriteData): Promise<ReviewWithRelations> =>
  prisma.review.create({ data, include: reviewInclude });

export const updateReview = (reviewId: string, data: ReviewUpdateData): Promise<ReviewWithRelations> =>
  prisma.review.update({ where: { reviewId }, data, include: reviewInclude });

export const deleteReview = (reviewId: string): Promise<void> =>
  prisma.review.delete({ where: { reviewId } }).then(() => undefined);

export const setHasAdminReply = (reviewId: string, hasAdminReply: boolean) =>
  prisma.review.update({ where: { reviewId }, data: { hasAdminReply } });

export const recalcProductRating = async (productId: string): Promise<void> => {
  const ratings = await findAllRatingsForProduct(productId);
  const totalReviews = ratings.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : Math.round((ratings.reduce((s, r) => s + r.rating, 0) / totalReviews) * 100) / 100;

  await prisma.product.update({
    where: { productId },
    data: { avgRating, totalReviews },
  });
};

// ─── Reply mutations ──────────────────────────────────────────────────────────

export const createReply = (reviewId: string, replyText: string) =>
  prisma.reviewReply.create({ data: { reviewId, replyText } });

// Insert the reply AND flip the review's hasAdminReply flag in one transaction, so a
// crash can't leave a reply row with the flag unset (which desyncs the pending-reply
// list and the duplicate-reply guard).
export const createReplyWithFlag = (reviewId: string, replyText: string): Promise<void> =>
  prisma.$transaction(async (tx) => {
    await tx.reviewReply.create({ data: { reviewId, replyText } });
    await tx.review.update({ where: { reviewId }, data: { hasAdminReply: true } });
  }).then(() => undefined);

export const updateReply = (replyId: string, replyText: string) =>
  prisma.reviewReply.update({ where: { replyId }, data: { replyText } });

export const deleteReply = (replyId: string) =>
  prisma.reviewReply.delete({ where: { replyId } });
