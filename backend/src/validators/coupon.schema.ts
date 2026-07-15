import { z } from "zod";

const couponFields = z.object({
  couponCode: z.string().min(3).max(30).transform((v) => v.toUpperCase()),
  couponType: z.enum(["PERCENTAGE", "FIXED"]),
  couponScope: z.enum(["CART", "CATEGORY", "PRODUCT"]).default("CART"),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  usageLimit: z.number().int().positive().optional(), // total redemptions (null = unlimited)
  perUserLimit: z.number().int().positive().optional(), // per-customer redemptions (null = unlimited)
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const createCouponSchema = couponFields
  .refine(
    (d) => !(d.couponScope === "CATEGORY" && !d.categoryId),
    { message: "categoryId is required for CATEGORY scope coupons.", path: ["categoryId"] },
  )
  .refine(
    (d) => !(d.couponScope === "PRODUCT" && !d.productId),
    { message: "productId is required for PRODUCT scope coupons.", path: ["productId"] },
  )
  .refine(
    (d) => !(d.couponType === "PERCENTAGE" && d.value > 100),
    { message: "Percentage value cannot exceed 100.", path: ["value"] },
  )
  .refine(
    (d) => !(d.startDate && d.endDate && new Date(d.startDate) >= new Date(d.endDate)),
    { message: "startDate must be before endDate.", path: ["endDate"] },
  );

export const updateCouponSchema = couponFields
  .partial()
  .refine(
    (d) => !(d.couponScope === "CATEGORY" && d.categoryId === undefined),
    { message: "categoryId is required when changing scope to CATEGORY.", path: ["categoryId"] },
  )
  .refine(
    (d) => !(d.couponScope === "PRODUCT" && d.productId === undefined),
    { message: "productId is required when changing scope to PRODUCT.", path: ["productId"] },
  )
  .refine(
    (d) => !(d.couponType === "PERCENTAGE" && d.value !== undefined && d.value > 100),
    { message: "Percentage value cannot exceed 100.", path: ["value"] },
  )
  .refine(
    (d) => !(d.startDate && d.endDate && new Date(d.startDate) >= new Date(d.endDate)),
    { message: "startDate must be before endDate.", path: ["endDate"] },
  );

export const couponListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CouponListQuery = z.infer<typeof couponListQuerySchema>;
