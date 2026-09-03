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

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1).max(200).optional(),
  comment: z.string().trim().max(1000).optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PROCESSING", "COD_PENDING", "COMPLETED", "FAILED", "CANCELLED"]),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// GET /orders (customer) — adds status/timeframe/search filters on top of pagination.
// Kept separate from orderListQuerySchema (used by the admin listing routes) so admin
// behavior is unaffected.
export const myOrderListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
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
    // Date-only (YYYY-MM-DD) — the repo treats endDate as inclusive of the whole day.
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
    // Matches against the product title of items in the order.
    search: z.string().trim().min(1).max(200).optional(),
  })
  .refine((d) => !(d.startDate && d.endDate && new Date(d.startDate) > new Date(d.endDate)), {
    message: "startDate must be before or equal to endDate.",
    path: ["endDate"],
  });

export const monthlyCountsQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2020)
    .max(2100)
    .default(new Date().getFullYear()),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type MyOrderListQuery = z.infer<typeof myOrderListQuerySchema>;
export type MonthlyCountsQuery = z.infer<typeof monthlyCountsQuerySchema>;
