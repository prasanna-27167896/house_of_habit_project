import { z } from "zod";

export const createReturnSchema = z.object({
  orderItemId: z.string().uuid("orderItemId must be a valid UUID"),
  reasonCategory: z.string().trim().min(1).max(100),
  reasonDetail: z.string().trim().min(1).max(1000),
  comment: z.string().trim().max(1000).optional(),
});

export const updateReturnStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
});

export const returnListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]).optional(),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;
export type ReturnListQuery = z.infer<typeof returnListQuerySchema>;
