import { prisma } from "@lib/prisma";
import type { Prisma } from "@generated/prisma/client";
import { Errors } from "@errors/index";
import type { CouponWithRelations, CouponWriteData } from "@interfaces/coupon.types";

type Tx = Prisma.TransactionClient;

const couponInclude = {
  category: { select: { categoryId: true, categoryTitle: true } },
  product: { select: { productId: true, title: true } },
} as const;

export const findCouponByCode = (couponCode: string): Promise<CouponWithRelations | null> =>
  prisma.coupon.findUnique({ where: { couponCode }, include: couponInclude });

export const findAllCoupons = (skip: number, take: number): Promise<CouponWithRelations[]> =>
  prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: couponInclude,
  });

export const countCoupons = (): Promise<number> => prisma.coupon.count();

export const createCoupon = (data: CouponWriteData): Promise<CouponWithRelations> =>
  prisma.coupon.create({ data, include: couponInclude });

export const updateCoupon = (couponId: string, data: CouponWriteData): Promise<CouponWithRelations> =>
  prisma.coupon.update({ where: { couponId }, data, include: couponInclude });

export const deleteCoupon = (couponCode: string): Promise<CouponWithRelations> =>
  prisma.coupon.delete({ where: { couponCode }, include: couponInclude });

// How many redemption rows reference this coupon — used to block a destructive delete
// that would cascade the redemption ledger (and any in-flight order's row) away.
export const countRedemptions = (couponId: string): Promise<number> =>
  prisma.couponRedemption.count({ where: { couponId } });

// ─── Reservation lifecycle (atomic usage limits + per-user cap) ────────────────
// Called from within the order-creation transaction so it's atomic with the order.

// Reserve a coupon slot for an order: enforce the per-user cap, then atomically
// bump the global counter only if it's still under the limit (column-comparison
// guard needs raw SQL — Prisma can't compare two columns in `where`). Finally,
// record the redemption in the ledger. Throws when a limit is reached.
export const reserveCoupon = async (
  tx: Tx,
  params: { couponCode: string; userId: string; orderId: string },
): Promise<void> => {
  const coupon = await tx.coupon.findUnique({
    where: { couponCode: params.couponCode },
    select: { couponId: true, perUserLimit: true },
  });
  if (!coupon) throw Errors.COUPON_NOT_FOUND();

  if (coupon.perUserLimit != null) {
    // Serialize concurrent reservations by the SAME user for this coupon, so the
    // count-then-insert below can't be raced past the cap (two of the user's own
    // checkouts both seeing count < limit, both inserting). A transaction-scoped
    // advisory lock keyed on (couponId, userId), auto-released at commit/rollback —
    // row locks can't help here since the racing rows don't exist yet (phantoms).
    // Different users never contend; the global counter's guarded UPDATE covers them.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${coupon.couponId}), hashtext(${params.userId}))`;

    const used = await tx.couponRedemption.count({
      where: { couponId: coupon.couponId, userId: params.userId },
    });
    if (used >= coupon.perUserLimit) throw Errors.COUPON_USER_LIMIT_REACHED();
  }

  const affected = await tx.$executeRaw`
    UPDATE "coupons"
    SET "usageCount" = "usageCount" + 1
    WHERE "couponId" = ${coupon.couponId}
      AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")
  `;
  if (affected === 0) throw Errors.COUPON_USAGE_LIMIT_REACHED();

  await tx.couponRedemption.create({
    data: { couponId: coupon.couponId, userId: params.userId, orderId: params.orderId },
  });
};

// Release a coupon slot when its order fails/expires: give the global count back
// and remove the redemption row.
export const releaseCoupon = async (tx: Tx, orderId: string): Promise<void> => {
  const redemption = await tx.couponRedemption.findUnique({
    where: { orderId },
    select: { id: true, couponId: true },
  });
  if (!redemption) return;

  await tx.coupon.update({
    where: { couponId: redemption.couponId },
    data: { usageCount: { decrement: 1 } },
  });
  await tx.couponRedemption.delete({ where: { id: redemption.id } });
};
