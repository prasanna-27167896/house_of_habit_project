import type { Prisma, ExchangeStatus } from "@generated/prisma/client";

export type { ExchangeStatus };

const orderItemSummarySelect = {
  orderItemId: true,
  variantId: true,
  productTitle: true,
  size: true,
  color: true,
  imageUrl: true,
  quantity: true,
} as const;

export type ExchangeRequestWithItem = Prisma.ExchangeRequestGetPayload<{
  include: { orderItem: { select: typeof orderItemSummarySelect } };
}>;

export type CreateExchangeRequestData = {
  orderId: string;
  orderItemId: string;
  originalSize: string;
  requestedSize: string;
  reasonCategory: string;
  reasonDetail: string;
};
