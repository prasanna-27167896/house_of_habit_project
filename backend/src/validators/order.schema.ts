import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
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
  ]),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PROCESSING", "COD_PENDING", "COMPLETED", "FAILED", "CANCELLED"]),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const monthlyCountsQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2020)
    .max(2100)
    .default(new Date().getFullYear()),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type MonthlyCountsQuery = z.infer<typeof monthlyCountsQuerySchema>;
