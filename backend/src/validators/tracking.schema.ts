import { z } from "zod";

export const addTrackingNoteSchema = z.object({
  description: z.string().trim().min(1).max(500),
  status: z
    .enum([
      "PENDING",
      "ORDER_PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "RETURN_REJECTED",
    ])
    .optional(),
});

export type AddTrackingNoteInput = z.infer<typeof addTrackingNoteSchema>;
