import { z } from "zod";

export const createDeliveryFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const deliveryFeedbackListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateDeliveryFeedbackInput = z.infer<typeof createDeliveryFeedbackSchema>;
export type DeliveryFeedbackListQuery = z.infer<typeof deliveryFeedbackListQuerySchema>;
