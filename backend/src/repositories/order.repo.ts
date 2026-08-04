import { prisma } from "@lib/prisma";
import { cartItemSelect } from "@repos/cart.repo";
import * as paymentRepo from "@repos/payment.repo";
import * as reservationRepo from "@repos/reservation.repo";
import * as couponRepo from "@repos/coupon.repo";
import { Errors } from "@errors/index";
import type {
  OrderWithRelations,
  OrderListResult,
  OrderStats,
  MonthlyCount,
  PendingOrderCreateData,
  ConfirmPaymentData,
} from "@interfaces/order.types";
import type { OrderStatus, PaymentStatus } from "@interfaces/order.types";
import type { CartItemWithDetails } from "@interfaces/cart.types";

// ─── Include spec ─────────────────────────────────────────────────────────────

const orderInclude = {
  user: { select: { userId: true, fullName: true, email: true, mobile: true } },
  shippingAddress: true,
  orderItems: {
    include: {
      variant: { select: { sku: true } },
    },
  },
  payments: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const findOrderById = (orderId: string): Promise<OrderWithRelations | null> =>
  prisma.order.findUnique({
    where: { orderId },
    include: orderInclude,
  }) as Promise<OrderWithRelations | null>;

export const findOrderByIdForUser = (orderId: string, userId: string): Promise<OrderWithRelations | null> =>
  prisma.order.findFirst({
    where: { orderId, userId },
    include: orderInclude,
  }) as Promise<OrderWithRelations | null>;

export const findOrdersByUser = (
  userId: string,
  skip: number,
  take: number,
): Promise<OrderWithRelations[]> =>
  prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  }) as Promise<OrderWithRelations[]>;

export const countOrdersByUser = (userId: string): Promise<number> =>
  prisma.order.count({ where: { userId } });

// Open (undelivered, non-cancelled) COD orders for a user. A COD order sits at
// paymentStatus COD_PENDING from placement until it's DELIVERED (→ COMPLETED) or
// CANCELLED, so this count is exactly the in-flight COD orders — used to cap them.
export const countOpenCodOrders = (userId: string): Promise<number> =>
  prisma.order.count({ where: { userId, paymentStatus: "COD_PENDING" } });

export const findAllOrders = (skip: number, take: number): Promise<OrderWithRelations[]> =>
  prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  }) as Promise<OrderWithRelations[]>;

export const countAllOrders = (): Promise<number> => prisma.order.count();

export const findAllOrdersNoPagination = (): Promise<OrderWithRelations[]> =>
  prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<OrderWithRelations[]>;

export const findOrdersByStatus = (status: OrderStatus): Promise<OrderWithRelations[]> =>
  prisma.order.findMany({
    where: { orderStatus: status },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<OrderWithRelations[]>;

export const findOrdersByUserId = (userId: string): Promise<OrderWithRelations[]> =>
  prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<OrderWithRelations[]>;

// Single cart item fetch — used by the single-item payment flows.
export const findCartItemForOrder = (
  cartItemId: string,
  userId: string,
): Promise<CartItemWithDetails | null> =>
  prisma.cartItem.findFirst({
    where: { cartItemId, cart: { userId } },
    select: cartItemSelect,
  }) as Promise<CartItemWithDetails | null>;

// ─── Cancel order (restore stock, release coupon, flag refund) ────────────────

export const cancelOrderTransaction = (
  orderId: string,
  cancelledBy: "CUSTOMER" | "ADMIN",
): Promise<OrderWithRelations> =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderId },
      include: { orderItems: true },
    });

    if (!order) throw new Error("Order not found");

    // Stock was actually deducted (not merely held) once the order was confirmed:
    //  - online COMPLETED → its holds were CONSUMED (stock stayed down)
    //  - COD (COD_PENDING or COMPLETED) → decremented directly at placement
    const stockDeducted =
      order.paymentStatus === "COMPLETED" || order.paymentStatus === "COD_PENDING";
    // Real money was collected only for a COMPLETED payment (online capture, or COD cash
    // collected on delivery). A COD_PENDING order never took money → no refund owed.
    const refundOwed = order.paymentStatus === "COMPLETED";

    // Give stock back:
    //  - pending/held orders still have ACTIVE reservations → release them (CAS-safe)
    //  - stock-deducted orders → add it straight back
    await reservationRepo.releaseReservations(tx, orderId);
    if (stockDeducted) {
      for (const item of order.orderItems) {
        await reservationRepo.restoreStock(tx, item.variantId, item.quantity);
      }
    }

    // Return the coupon slot (no-op if none was used)
    await couponRepo.releaseCoupon(tx, orderId);

    return tx.order.update({
      where: { orderId },
      data: {
        orderStatus: "CANCELLED",
        // Keep paymentStatus COMPLETED on a genuinely-paid order so we don't lose that
        // money was taken — the refund is tracked via refundStatus instead.
        paymentStatus: refundOwed ? "COMPLETED" : "CANCELLED",
        refundStatus: refundOwed ? "REFUND_PENDING" : "NONE",
        cancelledBy,
        cancelledAt: new Date(),
      },
      include: orderInclude,
    });
  }) as Promise<OrderWithRelations>;

// ─── Status / payment updates ─────────────────────────────────────────────────

export const updateOrderStatus = (
  orderId: string,
  orderStatus: OrderStatus,
  extra?: { deliveredAt?: Date; paymentStatus?: PaymentStatus },
): Promise<OrderWithRelations> =>
  prisma.order.update({
    where: { orderId },
    data: { orderStatus, ...extra },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

export const updatePaymentStatus = (
  orderId: string,
  paymentStatus: PaymentStatus,
): Promise<OrderWithRelations> =>
  prisma.order.update({
    where: { orderId },
    data: { paymentStatus },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

// Mark a pending refund as completed (after the admin refunds via Razorpay).
export const markRefunded = (orderId: string): Promise<OrderWithRelations> =>
  prisma.order.update({
    where: { orderId },
    data: { refundStatus: "REFUNDED", refundedAt: new Date() },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

// A payment was captured for an order that is already CANCELLED (its checkout was swept
// after the reservation TTL, or it was cancelled by an admin). The money is real, so
// record the payment and flag the order for a manual refund. Stock is deliberately NOT
// touched — the holds were already released when the order was cancelled.
export const recordCapturedPaymentForRefund = (
  orderId: string,
  data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    method: string | null;
  },
): Promise<void> =>
  prisma.$transaction(async (tx) => {
    await paymentRepo.txCreatePayment(tx, {
      orderId,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: "COMPLETED",
      source: "WEBHOOK",
    });
    await tx.order.update({
      where: { orderId },
      data: { refundStatus: "REFUND_PENDING" },
    });
  }).then(() => undefined);

export const deleteOrder = (orderId: string): Promise<OrderWithRelations> =>
  prisma.order.delete({
    where: { orderId },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

// ─── Payment module — pending order (no stock deduction, no cart clear) ───────

export const createPendingOrder = (data: PendingOrderCreateData): Promise<OrderWithRelations> =>
  prisma.order.create({
    data: {
      userId: data.userId,
      shippingAddressId: data.shippingAddressId,
      totalPrice: data.totalPrice,
      totalDiscountedPrice: data.totalDiscountedPrice,
      discount: data.discount,
      couponCode: data.couponCode,
      couponDiscount: data.couponDiscount,
      shippingCharge: data.shippingCharge,
      totalAmount: data.totalAmount,
      totalItems: data.totalItems,
      orderItems: {
        create: data.items.map((item) => ({
          variantId: item.variantId,
          productTitle: item.productTitle,
          size: item.size,
          color: item.color,
          imageUrl: item.imageUrl ?? null,
          quantity: item.quantity,
          price: item.price,
          discountedPrice: item.discountedPrice,
        })),
      },
    },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

// Online checkout: create the pending order AND reserve stock atomically.
// If any item is out of stock, reserveItems throws and the whole thing rolls
// back — no orphan order, no partial hold.
export const createPendingOrderWithReservation = (
  data: PendingOrderCreateData,
  expiresAt: Date,
): Promise<OrderWithRelations> =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: data.userId,
        shippingAddressId: data.shippingAddressId,
        totalPrice: data.totalPrice,
        totalDiscountedPrice: data.totalDiscountedPrice,
        discount: data.discount,
        couponCode: data.couponCode,
        couponDiscount: data.couponDiscount,
        shippingCharge: data.shippingCharge,
        totalAmount: data.totalAmount,
        totalItems: data.totalItems,
        orderItems: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            productTitle: item.productTitle,
            size: item.size,
            color: item.color,
            imageUrl: item.imageUrl ?? null,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice,
          })),
        },
      },
      include: orderInclude,
    });

    await reservationRepo.reserveItems(tx, {
      orderId: order.orderId,
      userId: data.userId,
      items: data.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        productTitle: i.productTitle,
      })),
      expiresAt,
    });

    // Reserve the coupon slot too (atomic global + per-user limits). Released with
    // the stock hold if the payment fails or the reservation expires.
    if (data.couponCode) {
      await couponRepo.reserveCoupon(tx, {
        couponCode: data.couponCode,
        userId: data.userId,
        orderId: order.orderId,
      });
    }

    return order as OrderWithRelations;
  }) as Promise<OrderWithRelations>;

export const setRazorpayOrderId = (
  orderId: string,
  razorpayOrderId: string,
): Promise<OrderWithRelations> =>
  prisma.order.update({
    where: { orderId },
    data: { razorpayOrderId, paymentStatus: "PROCESSING" },
    include: orderInclude,
  }) as Promise<OrderWithRelations>;

export const findOrderByRazorpayOrderId = (
  razorpayOrderId: string,
): Promise<OrderWithRelations | null> =>
  prisma.order.findFirst({
    where: { razorpayOrderId },
    include: orderInclude,
  }) as Promise<OrderWithRelations | null>;

// Confirm payment: atomically deducts stock, clears matching cart items, increments coupon.
//
// Idempotent: the frontend verify and the Razorpay webhook can both call this for the
// same order at nearly the same instant. The first statement atomically claims the order
// by flipping paymentStatus away from its current value; only one caller can win that
// UPDATE (Postgres re-checks the WHERE after the row lock is released, so the loser sees
// paymentStatus already COMPLETED → count 0). The winner does the real work; the loser
// returns the already-confirmed order without deducting stock or writing a payment row a
// second time.
export const confirmPaymentTransaction = (
  orderId: string,
  data: ConfirmPaymentData,
): Promise<OrderWithRelations> =>
  prisma.$transaction(async (tx) => {
    // COD collects cash on delivery, so a confirmed COD order is COD_PENDING (stock
    // deducted, money not yet in) until it's DELIVERED. Online payment is COMPLETED here.
    const finalPaymentStatus: PaymentStatus = data.source === "COD" ? "COD_PENDING" : "COMPLETED";

    // Idempotent claim: only proceed if the order hasn't already been confirmed. Both
    // COMPLETED and COD_PENDING count as "already confirmed" so a repeat call bails out.
    const claim = await tx.order.updateMany({
      where: { orderId, paymentStatus: { notIn: ["COMPLETED", "COD_PENDING"] } },
      data: { paymentStatus: finalPaymentStatus },
    });

    const order = await tx.order.findUnique({
      where: { orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found in confirmPaymentTransaction");

    // Lost the race — another path (verify or webhook) already confirmed this order.
    // Return it as-is; do NOT deduct stock / clear cart / write a duplicate payment row.
    if (claim.count === 0) return order as OrderWithRelations;

    const items = order.orderItems.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
      productTitle: i.productTitle,
    }));

    if (data.source === "COD") {
      // COD never reserved stock — deduct now, atomically guarded (no oversell).
      for (const item of items) {
        const ok = await reservationRepo.decrementStock(tx, item.variantId, item.quantity);
        if (!ok) {
          const v = await tx.productVariant.findUnique({
            where: { variantId: item.variantId },
            select: { stock: true },
          });
          throw Errors.OUT_OF_STOCK(item.productTitle, v?.stock ?? 0);
        }
      }
    } else {
      // Online: stock was held at checkout — turn the holds into a real sale.
      // If a hold was swept just before payment landed and the stock is truly
      // gone, the order can't be fulfilled → roll back; the captured payment is
      // logged for a manual/automated refund, and the sweep leaves stock intact.
      const { unfulfillable } = await reservationRepo.consumeReservations(tx, orderId, items);
      if (unfulfillable.length > 0) throw Errors.PAYMENT_STOCK_CONFLICT();
    }

    // Clear matching cart items (covers both full-cart and single-item orders)
    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      const variantIds = order.orderItems.map((i) => i.variantId);
      await tx.cartItem.deleteMany({
        where: { cartId: cart.cartId, variantId: { in: variantIds } },
      });
    }

    // Coupon usage:
    //  - Online: the slot was reserved at checkout — nothing to do here.
    //  - COD: no reservation happened, so reserve (and thereby consume) it now.
    if (order.couponCode && data.source === "COD") {
      await couponRepo.reserveCoupon(tx, {
        couponCode: order.couponCode,
        userId: order.userId,
        orderId,
      });
    }

    // Create Payment record — use actual Razorpay data when available (webhook path),
    // otherwise fall back to order values (frontend verify + COD path)
    await paymentRepo.txCreatePayment(tx, {
      orderId,
      razorpayOrderId: data.razorpayOrderId !== "COD" ? data.razorpayOrderId : null,
      razorpayPaymentId: data.paymentId !== "COD" ? data.paymentId : null,
      amount: data.actualAmount ?? order.totalAmount,
      currency: data.actualCurrency ?? "INR",
      method: data.paymentMethod,
      // COD → COD_PENDING (cash not collected yet); online → COMPLETED (captured).
      status: finalPaymentStatus,
      source: data.source,
    });

    return tx.order.update({
      where: { orderId },
      data: {
        orderStatus: "ORDER_PLACED",
        paymentStatus: finalPaymentStatus,
        paymentId: data.paymentId !== "COD" ? data.paymentId : null,
        paymentMethod: data.paymentMethod,
        razorpayOrderId: data.razorpayOrderId !== "COD" ? data.razorpayOrderId : null,
      },
      include: orderInclude,
    });
  }, {
    maxWait: 10000,
    timeout: 15000,
  }) as Promise<OrderWithRelations>;

// Mark a pending payment as failed — release any held stock back to inventory.
export const failPendingPayment = (
  orderId: string,
  source: "WEBHOOK" | "RAZORPAY_CREATE_ERROR" = "WEBHOOK",
): Promise<OrderWithRelations> =>
  prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { orderId } });

    if (order && order.paymentStatus !== "COMPLETED") {
      // Return reserved stock to inventory (no-op for COD / already-released holds)
      await reservationRepo.releaseReservations(tx, orderId);
      // Return the coupon slot too (no-op if no coupon was used)
      await couponRepo.releaseCoupon(tx, orderId);

      await paymentRepo.txCreatePayment(tx, {
        orderId,
        razorpayOrderId: order.razorpayOrderId ?? null,
        razorpayPaymentId: null,
        amount: order.totalAmount,
        currency: "INR",
        method: null,
        status: "FAILED",
        source,
      });
    }

    return tx.order.update({
      where: { orderId },
      data: {
        orderStatus: "CANCELLED",
        paymentStatus: "FAILED",
        // System-initiated cancellation (payment failed / never completed) — record it so
        // support can tell this apart from a customer/admin cancellation.
        cancelledBy: "SYSTEM",
        cancelledAt: new Date(),
      },
      include: orderInclude,
    });
  }) as Promise<OrderWithRelations>;

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getOrderStats = async (): Promise<OrderStats> => {
  const [grouped, revenueResult] = await Promise.all([
    prisma.order.groupBy({
      by: ["orderStatus"],
      _count: { orderId: true },
    }),
    prisma.order.aggregate({
      where: { orderStatus: "DELIVERED" },
      _sum: { totalAmount: true },
    }),
  ]);

  const counts = Object.fromEntries(
    grouped.map((g) => [g.orderStatus, g._count.orderId]),
  ) as Partial<Record<string, number>>;

  return {
    total: grouped.reduce((s, g) => s + g._count.orderId, 0),
    pending: counts["PENDING"] ?? 0,
    orderPlaced: counts["ORDER_PLACED"] ?? 0,
    confirmed: counts["CONFIRMED"] ?? 0,
    processing: counts["PROCESSING"] ?? 0,
    shipped: counts["SHIPPED"] ?? 0,
    inTransit: counts["IN_TRANSIT"] ?? 0,
    delivered: counts["DELIVERED"] ?? 0,
    cancelled: counts["CANCELLED"] ?? 0,
    returnRequested: counts["RETURN_REQUESTED"] ?? 0,
    returned: counts["RETURNED"] ?? 0,
    returnRejected: counts["RETURN_REJECTED"] ?? 0,
    totalRevenue: revenueResult._sum.totalAmount ?? 0,
  };
};

export const getMonthlyOrderCounts = async (year: number): Promise<MonthlyCount[]> => {
  type RawRow = { month: number; count: bigint };

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT EXTRACT(MONTH FROM "createdAt")::int AS month,
           COUNT(*)::bigint                     AS count
    FROM   orders
    WHERE  EXTRACT(YEAR FROM "createdAt") = ${year}
    GROUP  BY month
    ORDER  BY month
  `;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const byMonth = new Map(rows.map((r) => [r.month, Number(r.count)]));

  return Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i] as string,
    count: byMonth.get(i + 1) ?? 0,
  }));
};
