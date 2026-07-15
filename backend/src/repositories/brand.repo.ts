import { prisma } from "@lib/prisma";
import type { BrandWithCategory, BrandWriteData } from "@interfaces/brand.types";

const brandInclude = {
  category: { select: { categoryId: true, categoryTitle: true } },
} as const;

export const findBrandById = (brandId: string): Promise<BrandWithCategory | null> =>
  prisma.brand.findUnique({ where: { brandId }, include: brandInclude });

export const findAllBrands = (): Promise<BrandWithCategory[]> =>
  prisma.brand.findMany({ orderBy: { createdAt: "desc" }, include: brandInclude });

export const findBrandsByCategoryId = (categoryId: string): Promise<BrandWithCategory[]> =>
  prisma.brand.findMany({ where: { categoryId }, orderBy: { createdAt: "desc" }, include: brandInclude });

export const createBrand = (data: BrandWriteData): Promise<BrandWithCategory> =>
  prisma.brand.create({
    data: {
      brandName: data.brandName,
      brandCode: data.brandCode,
      status: data.status,
      imageUrl: data.imageUrl,
      imageKey: data.imageKey,
      ...(data.categoryId != null ? { categoryId: data.categoryId } : {}),
    },
    include: brandInclude,
  });

export const updateBrand = (brandId: string, data: BrandWriteData): Promise<BrandWithCategory> =>
  prisma.brand.update({
    where: { brandId },
    data: {
      brandName: data.brandName,
      brandCode: data.brandCode,
      status: data.status,
      imageUrl: data.imageUrl,
      imageKey: data.imageKey,
      ...(data.categoryId != null ? { categoryId: data.categoryId } : { categoryId: null }),
    },
    include: brandInclude,
  });

// Delete a brand and detach it from any products (their brandId → null), so the
// products stay intact. Returns how many products were affected (to warn the admin).
export const deleteBrandWithProducts = (brandId: string): Promise<number> =>
  prisma.$transaction(async (tx) => {
    const { count } = await tx.product.updateMany({ where: { brandId }, data: { brandId: null } });
    await tx.brand.delete({ where: { brandId } });
    return count;
  });

export const countBrandsByImageKey = (imageKey: string, excludeBrandId: string): Promise<number> =>
  prisma.brand.count({ where: { imageKey, brandId: { not: excludeBrandId } } });
