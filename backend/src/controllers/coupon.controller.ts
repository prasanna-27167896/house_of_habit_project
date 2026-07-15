import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as couponService from "@services/coupon.service";
import {
  createCouponSchema,
  updateCouponSchema,
  couponListQuerySchema,
} from "@validators/coupon.schema";

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = createCouponSchema.parse(req.body);
  const coupon = await couponService.createCoupon(input);
  sendSuccess(res, coupon, 201);
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponCode } = req.params as { couponCode: string };
  const input = updateCouponSchema.parse(req.body);
  const coupon = await couponService.updateCoupon(couponCode, input);
  sendSuccess(res, coupon);
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { couponCode } = req.params as { couponCode: string };
  await couponService.deleteCoupon(couponCode);
  sendSuccess(res, { message: "Coupon deleted successfully." });
});

export const getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
  const query = couponListQuerySchema.parse(req.query);
  const result = await couponService.getAllCoupons(query);
  sendSuccess(res, result);
});

export const getCouponByCode = asyncHandler(async (req: Request, res: Response) => {
  const { couponCode } = req.params as { couponCode: string };
  const coupon = await couponService.getCouponByCode(couponCode);
  sendSuccess(res, coupon);
});
