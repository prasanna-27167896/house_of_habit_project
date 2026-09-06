import { prisma } from "@lib/prisma";
import type { Prisma } from "@generated/prisma/client";
import * as couponRepo from "@repos/coupon.repo";
import { Errors } from "@errors/index";

type Tx = Prisma.TransactionClient;

// How long a checkout holds stock before the sweep can reclaim it.
export const RESERVATION_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const reservationExpiry = (): Date => new Date(Date.now() + RESERVATION_TTL_MS);

// One line item to reserve/consume/release.
export type ReserveItem = { variantId: string; quantity: number; productTitle: string };

// ─── Centralized stock mutations ─────────────────────────────────────────────
// Every stock change goes through these two functions. When the stock-movement
// ledger is added later, it becomes a single insert inside each of these.

// Atomic guarded decrement — only succeeds if enough stock remains. Returns
// whether it decremented (false = insufficient stock).
export const decrementStock = async (tx: Tx, variantId: string, quantity: number): Promise<boolean> => {
  const res = await tx.productVariant.updateMany({
    where: { variantId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });
  return res.count > 0;
};

export const restoreStock = (tx: Tx, variantId: string, quantity: number): Promise<unknown> =>
  tx.productVariant.update({
    where: { variantId },
    data: { stock: { increment: quantity } },
  });

// ─── Reserve (at checkout) ───────────────────────────────────────────────────
// For each item: atomically decrement available stock and record an ACTIVE hold.
// Throws OUT_OF_STOCK on the first item that can't be satisfied — because this
// runs inside the caller's transaction, the whole checkout rolls back.
export const reserveItems = async (
  tx: Tx,
  params: { orderId: string; userId: string; items: ReserveItem[]; expiresAt: Date },
): Promise<void> => {
  for (const item of params.items) {
    const ok = await decrementStock(tx, item.variantId, item.quantity);
    if (!ok) {
      const v = await tx.productVariant.findUnique({
        where: { variantId: item.variantId },
        select: { stock: true },
      });
      throw Errors.OUT_OF_STOCK(item.productTitle, v?.stock ?? 0);
    }
    await tx.inventoryReservation.create({
      data: {
        orderId: params.orderId,
        userId: params.userId,
        variantId: item.variantId,
        quantity: item.quantity,
        status: "ACTIVE",
        expiresAt: params.expiresAt,
      },
    });
  }
};

// ─── Consume (payment succeeded) ─────────────────────────────────────────────
// Flip each ACTIVE hold → CONSUMED (stock stays down; it's now a real sale).
// If a hold was already RELEASED by the sweep (payment landed after expiry),
// re-acquire the stock with a guarded decrement. Any item that can no longer be
// satisfied is returned as unfulfillable so the caller can flag it for refund.
export const consumeReservations = async (
  tx: Tx,
  orderId: string,
  items: ReserveItem[],
): Promise<{ unfulfillable: ReserveItem[] }> => {
  const unfulfillable: ReserveItem[] = [];
  for (const item of items) {
    const cas = await tx.inventoryReservation.updateMany({
      where: { orderId, variantId: item.variantId, status: "ACTIVE" },
      data: { status: "CONSUMED" },
    });
    if (cas.count === 0) {
      // Hold was swept before payment arrived — try to re-take the stock.
      const ok = await decrementStock(tx, item.variantId, item.quantity);
      if (!ok) unfulfillable.push(item);
    }
  }
  return { unfulfillable };
};

// ─── Release (payment failed / order cancelled) ──────────────────────────────
// Flip each ACTIVE hold → RELEASED and add the stock back. CAS-guarded so it
// can't double-restore if the sweep runs concurrently.
export const releaseReservations = async (tx: Tx, orderId: string): Promise<void> => {
  const active = await tx.inventoryReservation.findMany({
    where: { orderId, status: "ACTIVE" },
    select: { id: true, variantId: true, quantity: true },
  });
  for (const r of active) {
    const cas = await tx.inventoryReservation.updateMany({
      where: { id: r.id, status: "ACTIVE" },
      data: { status: "RELEASED" },
    });
    if (cas.count > 0) await restoreStock(tx, r.variantId, r.quantity);
  }
};

// ─── Sweep (cron) ────────────────────────────────────────────────────────────
// Reclaim stock from abandoned checkouts: for every order with expired ACTIVE
// holds, release them (CAS + restore) and cancel the still-pending order.
export const sweepExpiredReservations = async (): Promise<{ released: number; ordersCancelled: number }> => {
  const now = new Date();

  const orders = await prisma.inventoryReservation.findMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    select: { orderId: true },
    distinct: ["orderId"],
  });

  let released = 0;
  let ordersCancelled = 0;

  for (const { orderId } of orders) {
    await prisma.$transaction(
      async (tx) => {
        const active = await tx.inventoryReservation.findMany({
          where: { orderId, status: "ACTIVE", expiresAt: { lt: now } },
          select: { id: true, variantId: true, quantity: true },
        });

        for (const r of active) {
          const cas = await tx.inventoryReservation.updateMany({
            where: { id: r.id, status: "ACTIVE" },
            data: { status: "RELEASED" },
          });
          if (cas.count > 0) {
            await restoreStock(tx, r.variantId, r.quantity);
            released++;
          }
        }

        // Abandoned checkout → cancel the pending order (never completed).
        const order = await tx.order.findUnique({
          where: { orderId },
          select: { paymentStatus: true, orderStatus: true },
        });
        if (order && order.paymentStatus !== "COMPLETED" && order.orderStatus !== "CANCELLED") {
          // Return the coupon slot for this abandoned order (no-op if none used).
          await couponRepo.releaseCoupon(tx, orderId);
          await tx.order.update({
            where: { orderId },
            data: {
              orderStatus: "CANCELLED",
              paymentStatus: "FAILED",
              // Abandoned checkout reclaimed by the sweep — mark it system-cancelled so it's
              // distinguishable from a customer/admin cancellation.
              cancelledBy: "SYSTEM",
              cancelledAt: new Date(),
            },
          });
          ordersCancelled++;
        }
      },
      { maxWait: 10000, timeout: 25000 },
    );

  }

  return { released, ordersCancelled };
};
