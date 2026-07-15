import type { Category } from "@generated/prisma/client";

export type { Category };

export type CategoryWriteData = {
  categoryTitle: string;
  categoryDescription: string | null;
  imageUrl: string | null;
  imageKey: string | null;
};
