import { prisma } from "@lib/prisma";
import type { ExchangeRequestWithItem, CreateExchangeRequestData, ExchangeStatus } from "@interfaces/exchange.types";

const orderItemSummarySelect = {
  orderItemId: true,
  variantId: true,
  productTitle: true,
  size: true,
  color: true,
  imageUrl: true,
  quantity: true,
} as const;

const exchangeInclude = { orderItem: { select: orderItemSummarySelect } } as const;

export const createExchangeRequest = (data: CreateExchangeRequestData): Promise<ExchangeRequestWithItem> =>
  prisma.exchangeRequest.create({
    data: {
      orderId: data.orderId,
      orderItemId: data.orderItemId,
      originalSize: data.originalSize,
      requestedSize: data.requestedSize,
      reasonCategory: data.reasonCategory,
      reasonDetail: data.reasonDetail,
    },
    include: exchangeInclude,
  }) as Promise<ExchangeRequestWithItem>;

export const findExchangeByOrderItemId = (orderItemId: string): Promise<ExchangeRequestWithItem | null> =>
  prisma.exchangeRequest.findUnique({
    where: { orderItemId },
    include: exchangeInclude,
  }) as Promise<ExchangeRequestWithItem | null>;

export const findExchangeById = (exchangeId: string): Promise<ExchangeRequestWithItem | null> =>
  prisma.exchangeRequest.findUnique({
    where: { exchangeId },
    include: exchangeInclude,
  }) as Promise<ExchangeRequestWithItem | null>;

export const findExchangesByOrderId = (orderId: string): Promise<ExchangeRequestWithItem[]> =>
  prisma.exchangeRequest.findMany({
    where: { orderId },
    include: exchangeInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<ExchangeRequestWithItem[]>;

export const findAllExchanges = (
  skip: number,
  take: number,
  status?: ExchangeStatus,
): Promise<ExchangeRequestWithItem[]> =>
  prisma.exchangeRequest.findMany({
    where: status ? { status } : {},
    include: exchangeInclude,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  }) as Promise<ExchangeRequestWithItem[]>;

export const countAllExchanges = (status?: ExchangeStatus): Promise<number> =>
  prisma.exchangeRequest.count({ where: status ? { status } : {} });

export const updateExchangeStatus = (exchangeId: string, status: ExchangeStatus): Promise<ExchangeRequestWithItem> =>
  prisma.exchangeRequest.update({
    where: { exchangeId },
    data: { status },
    include: exchangeInclude,
  }) as Promise<ExchangeRequestWithItem>;
