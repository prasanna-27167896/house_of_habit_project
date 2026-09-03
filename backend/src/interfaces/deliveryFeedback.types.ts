import type { Prisma, DeliveryFeedback } from "@generated/prisma/client";

export type { DeliveryFeedback };

export type DeliveryFeedbackWithOrder = Prisma.DeliveryFeedbackGetPayload<{
  include: { order: { select: { orderId: true; userId: true } } };
}>;

export type CreateDeliveryFeedbackData = {
  orderId: string;
  rating: number;
  comment?: string | null;
};
