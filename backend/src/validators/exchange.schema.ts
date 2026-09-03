import { z } from "zod";

export const createExchangeSchema = z.object({
  orderItemId: z.string().uuid("orderItemId must be a valid UUID"),
  requestedSize: z.string().trim().min(1).max(50),
  reasonCategory: z.string().trim().min(1).max(100),
  reasonDetail: z.string().trim().min(1).max(1000),
});

export const updateExchangeStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]),
});

export const exchangeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED"]).optional(),
});

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>;
export type UpdateExchangeStatusInput = z.infer<typeof updateExchangeStatusSchema>;
export type ExchangeListQuery = z.infer<typeof exchangeListQuerySchema>;
