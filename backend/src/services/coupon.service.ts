import * as couponRepo from "@repos/coupon.repo";
import * as categoryRepo from "@repos/category.repo";
import * as productRepo from "@repos/product.repo";
import { Errors } from "@errors/index";
import type {
  CouponWithRelations,
  PublicCouponResult,
  CouponListResult,
} from "@interfaces/coupon.types";
import type { CreateCouponInput, UpdateCouponInput, CouponListQuery } from "@validators/coupon.schema";

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export const createCoupon = async (input: CreateCouponInput): Promise<CouponWithRelations> => {
  const existing = await couponRepo.findCouponByCode(input.couponCode);
  if (existing) throw Errors.COUPON_CODE_ALREADY_EXISTS(input.couponCode);

  if (input.couponScope === "CATEGORY" && input.categoryId != null) {
    const cat = await categoryRepo.findCategoryById(input.categoryId);
    if (!cat) throw Errors.CATEGORY_NOT_FOUND();
  }

  if (input.couponScope === "PRODUCT" && input.productId != null) {
    const product = await productRepo.findActiveProduct(input.productId);
    if (!product) throw Errors.PRODUCT_NOT_FOUND();
  }

  return couponRepo.createCoupon({
    couponCode: input.couponCode,
    couponType: input.couponType,
    couponScope: input.couponScope,
    value: input.value,
    minOrderValue: input.minOrderValue ?? null,
    maxDiscount: input.maxDiscount ?? null,
    isActive: input.isActive ?? true,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    usageLimit: input.usageLimit ?? null,
    perUserLimit: input.perUserLimit ?? null,
    categoryId: input.categoryId ?? null,
    productId: input.productId ?? null,
  });
};

export const updateCoupon = async (
  couponCode: string,
  input: UpdateCouponInput,
): Promise<CouponWithRelations> => {
  const coupon = await couponRepo.findCouponByCode(couponCode.toUpperCase());
  if (!coupon) throw Errors.COUPON_NOT_FOUND();

  const newCode = input.couponCode ?? coupon.couponCode;

  if (input.couponCode && input.couponCode !== coupon.couponCode) {
    const codeExists = await couponRepo.findCouponByCode(input.couponCode);
    if (codeExists) throw Errors.COUPON_CODE_ALREADY_EXISTS(input.couponCode);
  }

  const newScope = input.couponScope ?? coupon.couponScope;
  const newCategoryId = input.categoryId !== undefined ? (input.categoryId ?? null) : coupon.categoryId;
  const newProductId = input.productId !== undefined ? (input.productId ?? null) : coupon.productId;

  if (newScope === "CATEGORY" && newCategoryId != null) {
    const cat = await categoryRepo.findCategoryById(newCategoryId);
    if (!cat) throw Errors.CATEGORY_NOT_FOUND();
  }

  if (newScope === "PRODUCT" && newProductId != null) {
    const product = await productRepo.findActiveProduct(newProductId);
    if (!product) throw Errors.PRODUCT_NOT_FOUND();
  }

  return couponRepo.updateCoupon(coupon.couponId, {
    couponCode: newCode,
    couponType: input.couponType ?? coupon.couponType,
    couponScope: newScope,
    value: input.value ?? coupon.value,
    minOrderValue: input.minOrderValue !== undefined ? (input.minOrderValue ?? null) : coupon.minOrderValue,
    maxDiscount: input.maxDiscount !== undefined ? (input.maxDiscount ?? null) : coupon.maxDiscount,
    isActive: input.isActive !== undefined ? input.isActive : coupon.isActive,
    startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : coupon.startDate,
    endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : coupon.endDate,
    usageLimit: input.usageLimit !== undefined ? (input.usageLimit ?? null) : coupon.usageLimit,
    perUserLimit: input.perUserLimit !== undefined ? (input.perUserLimit ?? null) : coupon.perUserLimit,
    categoryId: newCategoryId,
    productId: newProductId,
  });
};

export const deleteCoupon = async (couponCode: string): Promise<void> => {
  const coupon = await couponRepo.findCouponByCode(couponCode.toUpperCase());
  if (!coupon) throw Errors.COUPON_NOT_FOUND();

  // Deleting cascades away the redemption ledger (onDelete: Cascade) — including any
  // in-flight order's reservation row. Preserve history: block the delete once the coupon
  // has been redeemed and steer the admin to deactivate (isActive: false) instead.
  const redemptions = await couponRepo.countRedemptions(coupon.couponId);
  if (redemptions > 0) throw Errors.COUPON_HAS_REDEMPTIONS();

  await couponRepo.deleteCoupon(coupon.couponCode);
};

export const getAllCoupons = async (query: CouponListQuery): Promise<CouponListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [coupons, total] = await Promise.all([
    couponRepo.findAllCoupons(skip, query.limit),
    couponRepo.countCoupons(),
  ]);
  return { coupons, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

// ─── Public — get + validate ──────────────────────────────────────────────────

export const getCouponByCode = async (couponCode: string): Promise<PublicCouponResult> => {
  const coupon = await couponRepo.findCouponByCode(couponCode.toUpperCase());
  if (!coupon) throw Errors.COUPON_NOT_FOUND();

  const now = new Date();
  let isValid = true;
  let invalidReason: string | null = null;

  if (!coupon.isActive) {
    isValid = false;
    invalidReason = "Coupon is inactive.";
  } else if (coupon.startDate && now < coupon.startDate) {
    isValid = false;
    invalidReason = "Coupon is not yet valid.";
  } else if (coupon.endDate && now > coupon.endDate) {
    isValid = false;
    invalidReason = "Coupon has expired.";
  } else if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    isValid = false;
    invalidReason = "Coupon usage limit reached.";
  }

  // Return only public-safe fields — never spread the raw coupon, which would leak
  // usageCount / usageLimit / perUserLimit and let callers probe campaign exhaustion.
  return {
    couponCode: coupon.couponCode,
    couponType: coupon.couponType,
    couponScope: coupon.couponScope,
    value: coupon.value,
    minOrderValue: coupon.minOrderValue,
    maxDiscount: coupon.maxDiscount,
    category: coupon.category,
    product: coupon.product,
    isValid,
    invalidReason,
  };
};

// ─── Internal — used by orders / cart module ──────────────────────────────────

export const validateCoupon = async (couponCode: string): Promise<CouponWithRelations> => {
  const coupon = await couponRepo.findCouponByCode(couponCode.toUpperCase());
  if (!coupon) throw Errors.COUPON_NOT_FOUND();
  if (!coupon.isActive) throw Errors.COUPON_INACTIVE();

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) throw Errors.COUPON_NOT_YET_VALID();
  if (coupon.endDate && now > coupon.endDate) throw Errors.COUPON_EXPIRED();
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw Errors.COUPON_USAGE_LIMIT_REACHED();
  }

  return coupon;
};
