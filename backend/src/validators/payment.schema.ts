import { z } from "zod";

// A single shape for every checkout entry point (initiate, initiate-single, COD).
// addressId is optional — falls back to the user's default address when omitted.
export const checkoutSchema = z.object({
  addressId: z.string().uuid("addressId must be a valid UUID").optional(),
  couponCode: z
    .string()
    .min(3)
    .max(30)
    .transform((v) => v.toUpperCase())
    .optional(),
});

export const initiatePaymentSchema = checkoutSchema;
export const initiatePaymentSingleSchema = checkoutSchema;
export const codCheckoutSchema = checkoutSchema;

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid("orderId must be a valid UUID"),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type InitiatePaymentInput = CheckoutInput;
export type InitiatePaymentSingleInput = CheckoutInput;
export type CodCheckoutInput = CheckoutInput;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
