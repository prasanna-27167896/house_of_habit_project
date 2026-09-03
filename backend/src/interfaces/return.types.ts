import type { Prisma, ReturnStatus } from "@generated/prisma/client";

export type { ReturnStatus };

const orderItemSummarySelect = {
  orderItemId: true,
  variantId: true,
  productTitle: true,
  size: true,
  color: true,
  imageUrl: true,
  quantity: true,
} as const;

export type ReturnRequestWithItem = Prisma.ReturnRequestGetPayload<{
  include: { orderItem: { select: typeof orderItemSummarySelect } };
}>;

export type CreateReturnRequestData = {
  orderId: string;
  orderItemId: string;
  reasonCategory: string;
  reasonDetail: string;
  comment?: string | null;
};
