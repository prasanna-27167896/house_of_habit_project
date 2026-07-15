import { z } from "zod";

export const createBrandSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required"),
  brandCode: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  imageKey: z.string().min(1).optional(),
});

export const updateBrandSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").optional(),
  brandCode: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  imageKey: z.string().min(1).optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
