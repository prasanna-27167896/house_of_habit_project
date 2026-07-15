import type { Prisma } from "@generated/prisma/client";

export type BrandWithCategory = Prisma.BrandGetPayload<{
  include: { category: { select: { categoryId: true; categoryTitle: true } } };
}>;

export type BrandWriteData = {
  brandName: string;
  brandCode: string | null;
  status: string;
  categoryId: string | null;
  imageUrl: string | null;
  imageKey: string | null;
};
