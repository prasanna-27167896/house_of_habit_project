import { z } from "zod";

const ALLOWED_FOLDERS = ["categories", "brands", "products"] as const;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const presignSchema = z.object({
  folder: z.enum(ALLOWED_FOLDERS, { error: "folder must be one of: categories, brands, products" }),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    error: "contentType must be one of: image/jpeg, image/png, image/webp",
  }),
  fileSize: z.number().int().min(1).max(MAX_FILE_SIZE, "File size must not exceed 5 MB"),
});

export type PresignInput = z.infer<typeof presignSchema>;
