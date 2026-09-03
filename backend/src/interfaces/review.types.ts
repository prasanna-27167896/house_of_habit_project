import type { Prisma } from "@generated/prisma/client";

// ─── Prisma include shapes ────────────────────────────────────────────────────

const reviewIncludeObj = {
  user: { select: { userId: true, fullName: true, imageUrl: true } },
  product: { select: { productId: true, title: true } },
  reply: true,
} as const;

export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: typeof reviewIncludeObj;
}>;

// ─── Write data ───────────────────────────────────────────────────────────────

export type ReviewWriteData = {
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  imageKey: string | null;
};

export type ReviewUpdateData = {
  rating?: number;
  title?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  imageKey?: string | null;
};

// ─── List result ──────────────────────────────────────────────────────────────

export type ReviewListResult = {
  reviews: ReviewWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
