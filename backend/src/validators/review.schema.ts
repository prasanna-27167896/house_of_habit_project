import { z } from "zod";

// The review photo must have gone through POST /upload/presign-review, which only ever
// writes into the "reviews/" folder — this guards against a client linking some other
// R2 key (e.g. a product image) onto a review.
const reviewImageKey = z
  .string()
  .refine((key) => key.startsWith("reviews/"), { error: "imageKey must be a key returned by /upload/presign-review" });

export const createReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    title: z.string().max(150).optional(),
    body: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    imageKey: reviewImageKey.optional(),
  })
  .refine((data) => Boolean(data.imageUrl) === Boolean(data.imageKey), {
    error: "imageUrl and imageKey must be provided together",
  });

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(150).nullable().optional(),
    body: z.string().max(2000).nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    imageKey: reviewImageKey.nullable().optional(),
  })
  .refine((data) => Boolean(data.imageUrl) === Boolean(data.imageKey), {
    error: "imageUrl and imageKey must be provided (or cleared) together",
  });

export const createReplySchema = z.object({
  replyText: z.string().min(1).max(2000),
});

export const reviewListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type ReviewListQuery = z.infer<typeof reviewListSchema>;
