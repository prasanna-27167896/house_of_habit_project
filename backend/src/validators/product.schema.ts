import { z } from "zod";

// ─── Variant ──────────────────────────────────────────────────────────────────

export const createVariantSchema = z.object({
  size: z.string().trim().min(1, "Size is required"),
  color: z.string().trim().min(1, "Color is required"),
  colorCode: z.string().trim().optional(),
  sku: z.string().trim().min(1, "SKU is required"),
  stock: z.number().int().min(0).default(0),
  price: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = z.object({
  size: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
  colorCode: z.string().trim().optional(),
  sku: z.string().trim().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  price: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ─── Product ──────────────────────────────────────────────────────────────────

const GENDERS = ["MEN", "WOMEN", "UNISEX", "KIDS"] as const;
const FIT_TYPES = ["SLIM", "REGULAR", "LOOSE", "OVERSIZED"] as const;
const SEASONS = ["SUMMER", "WINTER", "MONSOON", "ALL_SEASON"] as const;

export const createProductSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  longDescription: z.string().trim().optional(),

  price: z.number().int().positive("Price must be a positive integer"),
  discountedPrice: z.number().int().min(0, "Discounted price must be >= 0"),
  // discountPercentage is derived from price/discountedPrice server-side — not accepted as input.

  gender: z.enum(GENDERS).optional(),
  fitType: z.enum(FIT_TYPES).optional(),
  season: z.enum(SEASONS).optional(),
  material: z.string().trim().optional(),
  occasion: z.string().trim().optional(),
  pattern: z.string().trim().optional(),

  imageUrl: z.string().url().optional(),
  imageKey: z.string().min(1).optional(),
  imageUrl1: z.string().url().optional(),
  imageKey1: z.string().min(1).optional(),
  imageUrl2: z.string().url().optional(),
  imageKey2: z.string().min(1).optional(),
  imageUrl3: z.string().url().optional(),
  imageKey3: z.string().min(1).optional(),

  returnPolicy: z.string().trim().optional(),

  categoryId: z.string().uuid("categoryId must be a valid UUID"),
  brandId: z.string().uuid().optional(),

  variants: z.array(createVariantSchema).optional(),
})
  .refine((d) => d.discountedPrice <= d.price, {
    message: "Discounted price cannot exceed the original price.",
    path: ["discountedPrice"],
  });

export const updateProductSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().optional(),
  longDescription: z.string().trim().optional(),

  price: z.number().int().positive().optional(),
  discountedPrice: z.number().int().min(0).optional(),
  // discountPercentage is derived from price/discountedPrice server-side — not accepted as input.

  gender: z.enum(GENDERS).nullable().optional(),
  fitType: z.enum(FIT_TYPES).nullable().optional(),
  season: z.enum(SEASONS).nullable().optional(),
  material: z.string().trim().nullable().optional(),
  occasion: z.string().trim().nullable().optional(),
  pattern: z.string().trim().nullable().optional(),

  imageUrl: z.string().url().nullable().optional(),
  imageKey: z.string().min(1).nullable().optional(),
  imageUrl1: z.string().url().nullable().optional(),
  imageKey1: z.string().min(1).nullable().optional(),
  imageUrl2: z.string().url().nullable().optional(),
  imageKey2: z.string().min(1).nullable().optional(),
  imageUrl3: z.string().url().nullable().optional(),
  imageKey3: z.string().min(1).nullable().optional(),

  returnPolicy: z.string().trim().nullable().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().nullable().optional(),
});

// ─── Query params ─────────────────────────────────────────────────────────────

export const productListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["newest", "price_low_high", "price_high_low", "popular"]).default("newest"),
});

export const productSearchSchema = z.object({
  keyword: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  gender: z.enum(GENDERS).optional(),
  season: z.enum(SEASONS).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["newest", "price_low_high", "price_high_low", "popular"]).default("newest"),
})
  .refine((d) => d.minPrice == null || d.maxPrice == null || d.minPrice <= d.maxPrice, {
    message: "minPrice cannot be greater than maxPrice.",
    path: ["minPrice"],
  });

export const bestSellingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type ProductListQuery = z.infer<typeof productListSchema>;
export type ProductSearchQuery = z.infer<typeof productSearchSchema>;
export type BestSellingQuery = z.infer<typeof bestSellingQuerySchema>;
