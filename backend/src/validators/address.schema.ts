import { z } from "zod";

const ADDRESS_TYPES = ["HOME", "WORK", "OTHER"] as const;

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone must be a 10-digit number"),
  addressLine1: z.string().trim().min(5, "Address line 1 must be at least 5 characters"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
  country: z.string().trim().default("India"),
  addressType: z.enum(ADDRESS_TYPES).default("HOME"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone must be a 10-digit number").optional(),
  addressLine1: z.string().trim().min(5).optional(),
  addressLine2: z.string().trim().nullable().optional(),
  city: z.string().trim().min(2).optional(),
  state: z.string().trim().min(2).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be a 6-digit number").optional(),
  country: z.string().trim().optional(),
  addressType: z.enum(ADDRESS_TYPES).optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
