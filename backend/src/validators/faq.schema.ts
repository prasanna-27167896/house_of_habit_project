import { z } from "zod";

export const createFaqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateFaqSchema = z.object({
  question: z.string().min(5).max(300).optional(),
  answer: z.string().min(5).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const upsertStoreInfoSchema = z.object({
  storeName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  description: z.string().optional(),
  instagramUrl: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  shippingCharge: z.number().min(0).optional(),
  freeShippingAbove: z.number().min(0).optional().nullable(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type UpsertStoreInfoInput = z.infer<typeof upsertStoreInfoSchema>;
