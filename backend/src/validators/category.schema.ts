import { z } from "zod";

export const createCategorySchema = z.object({
  categoryTitle: z.string().trim().min(4, "Category title must be at least 4 characters"),
  categoryDescription: z
    .string()
    .trim()
    .min(10, "Category description must be at least 10 characters")
    .optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  imageKey: z.string().min(1).optional(),
});

export const updateCategorySchema = z.object({
  categoryTitle: z
    .string()
    .trim()
    .min(4, "Category title must be at least 4 characters")
    .optional(),
  categoryDescription: z
    .string()
    .trim()
    .min(10, "Category description must be at least 10 characters")
    .optional(),
  imageUrl: z.string().url("imageUrl must be a valid URL").optional(),
  imageKey: z.string().min(1).optional(),
});

export const toggleCategorySchema = z.object({
  status: z.enum(["true", "false"], {
    error: "status query param must be 'true' or 'false'",
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ToggleCategoryInput = z.infer<typeof toggleCategorySchema>;
