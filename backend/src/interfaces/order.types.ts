import type { Prisma, OrderStatus, PaymentStatus } from "@generated/prisma/client";

export type { OrderStatus, PaymentStatus };

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    user: { select: { userId: true; fullName: true; email: true; mobile: true } };
    shippingAddress: true;
    orderItems: {
      include: {
        variant: { select: { sku: true; productId: true } };
      };
    };
    payments: true;
  };
}>;

export type OrderListResult = {
  orders: OrderWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrderStats = {
  total: number;
  pending: number;
  orderPlaced: number;
  confirmed: number;
  processing: number;
  shipped: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  returnRequested: number;
  returned: number;
  returnRejected: number;
  totalRevenue: number;
};

export type MonthlyCount = {
  month: string;
  count: number;
};

export type OrderItemCreateData = {
  variantId: string;
  productTitle: string;
  size: string;
  color: string;
  imageUrl: string | null;
  quantity: number;
  price: number;
  discountedPrice: number;
};

// Used by payment module — no stock deduction, no cart clearing at order creation
export type PendingOrderCreateData = {
  userId: string;
  shippingAddressId: string;
  items: OrderItemCreateData[];
  totalPrice: number;
  totalDiscountedPrice: number;
  discount: number;
  couponCode: string | null;
  couponDiscount: number | null;
  shippingCharge: number;
  totalAmount: number;
  totalItems: number;
};

// Used by confirmPaymentTransaction
export type ConfirmPaymentData = {
  paymentId: string;
  paymentMethod: string;
  razorpayOrderId: string;
  source: "FRONTEND_VERIFY" | "WEBHOOK" | "COD";
  // Webhook passes actual Razorpay payment data (in rupees) so the Payment
  // record reflects what Razorpay charged, not just what our order expected
  actualAmount?: number;
  actualCurrency?: string;
};

