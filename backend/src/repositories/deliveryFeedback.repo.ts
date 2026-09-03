import { prisma } from "@lib/prisma";
import type {
  DeliveryFeedback,
  DeliveryFeedbackWithOrder,
  CreateDeliveryFeedbackData,
} from "@interfaces/deliveryFeedback.types";

export const createDeliveryFeedback = (data: CreateDeliveryFeedbackData): Promise<DeliveryFeedback> =>
  prisma.deliveryFeedback.create({
    data: {
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment ?? null,
    },
  });

export const findDeliveryFeedbackByOrderId = (orderId: string): Promise<DeliveryFeedback | null> =>
  prisma.deliveryFeedback.findUnique({ where: { orderId } });

export const findAllDeliveryFeedback = (skip: number, take: number): Promise<DeliveryFeedbackWithOrder[]> =>
  prisma.deliveryFeedback.findMany({
    include: { order: { select: { orderId: true, userId: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  }) as Promise<DeliveryFeedbackWithOrder[]>;

export const countAllDeliveryFeedback = (): Promise<number> => prisma.deliveryFeedback.count();
