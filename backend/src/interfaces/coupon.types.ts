import type { Prisma, CouponType, CouponScope } from "@generated/prisma/client";

export type { CouponType, CouponScope };

export type CouponWithRelations = Prisma.CouponGetPayload<{
  include: {
    category: { select: { categoryId: true; categoryTitle: true } };
    product: { select: { productId: true; title: true } };
  };
}>;

export type CouponWriteData = {
  couponCode: string;
  couponType: CouponType;
  couponScope: CouponScope;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  categoryId: string | null;
  productId: string | null;
};

// Public-safe view returned by the public GET /coupons/:code. Deliberately omits internal
// campaign config (usageCount / usageLimit / perUserLimit / ids / isActive / dates) so a
// public caller can't probe how close a coupon is to exhaustion.
export type PublicCouponResult = {
  couponCode: string;
  couponType: CouponType;
  couponScope: CouponScope;
  value: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  category: { categoryId: string; categoryTitle: string } | null;
  product: { productId: string; title: string } | null;
  isValid: boolean;
  invalidReason: string | null;
};

export type CouponListResult = {
  coupons: CouponWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
