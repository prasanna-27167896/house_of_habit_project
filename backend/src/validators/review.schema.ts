import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  body: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(150).nullable().optional(),
  body: z.string().max(2000).nullable().optional(),
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
