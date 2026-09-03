import { prisma } from "@lib/prisma";
import type { ReturnRequestWithItem, CreateReturnRequestData, ReturnStatus } from "@interfaces/return.types";

const orderItemSummarySelect = {
  orderItemId: true,
  variantId: true,
  productTitle: true,
  size: true,
  color: true,
  imageUrl: true,
  quantity: true,
} as const;

const returnInclude = { orderItem: { select: orderItemSummarySelect } } as const;

export const createReturnRequest = (data: CreateReturnRequestData): Promise<ReturnRequestWithItem> =>
  prisma.returnRequest.create({
    data: {
      orderId: data.orderId,
      orderItemId: data.orderItemId,
      reasonCategory: data.reasonCategory,
      reasonDetail: data.reasonDetail,
      comment: data.comment ?? null,
    },
    include: returnInclude,
  }) as Promise<ReturnRequestWithItem>;

export const findReturnByOrderItemId = (orderItemId: string): Promise<ReturnRequestWithItem | null> =>
  prisma.returnRequest.findUnique({
    where: { orderItemId },
    include: returnInclude,
  }) as Promise<ReturnRequestWithItem | null>;

export const findReturnById = (returnId: string): Promise<ReturnRequestWithItem | null> =>
  prisma.returnRequest.findUnique({
    where: { returnId },
    include: returnInclude,
  }) as Promise<ReturnRequestWithItem | null>;

export const findReturnsByOrderId = (orderId: string): Promise<ReturnRequestWithItem[]> =>
  prisma.returnRequest.findMany({
    where: { orderId },
    include: returnInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<ReturnRequestWithItem[]>;

export const findAllReturns = (skip: number, take: number, status?: ReturnStatus): Promise<ReturnRequestWithItem[]> =>
  prisma.returnRequest.findMany({
    where: status ? { status } : {},
    include: returnInclude,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  }) as Promise<ReturnRequestWithItem[]>;

export const countAllReturns = (status?: ReturnStatus): Promise<number> =>
  prisma.returnRequest.count({ where: status ? { status } : {} });

export const updateReturnStatus = (returnId: string, status: ReturnStatus): Promise<ReturnRequestWithItem> =>
  prisma.returnRequest.update({
    where: { returnId },
    data: { status },
    include: returnInclude,
  }) as Promise<ReturnRequestWithItem>;
