import type { Prisma, Product, Gender, FitType, Season } from "@generated/prisma/client";

export type { Product, Gender, FitType, Season };

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: { select: { categoryId: true; categoryTitle: true } };
    brand: { select: { brandId: true; brandName: true } };
    variants: true;
  };
}>;

export type ProductVariant = Prisma.ProductVariantGetPayload<{}>;

export type ProductListResult = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductGroupedCategory = {
  categoryId: string;
  categoryTitle: string;
  products: ProductWithRelations[];
};

export type ToggleProductResult = {
  productId: string;
  isDisabled: boolean;
};
