import { prisma } from "@lib/prisma";
import type { Category, CategoryWriteData } from "@interfaces/category.types";

export const findCategoryById = (categoryId: string): Promise<Category | null> =>
  prisma.category.findFirst({ where: { categoryId, isDeleted: false } });

export const findCategoryByTitle = (categoryTitle: string): Promise<Category | null> =>
  prisma.category.findUnique({ where: { categoryTitle } });

export const findAllActiveCategories = (): Promise<Category[]> =>
  prisma.category.findMany({
    where: { isDeleted: false, isDisabled: false },
    orderBy: { createdAt: "asc" },
  });

export const createCategory = (data: CategoryWriteData): Promise<Category> =>
  prisma.category.create({ data });

// Reuse a soft-deleted category row (the title is globally unique, so we revive
// the tombstone instead of hitting a unique-constraint error on a fresh insert).
export const reviveCategory = (categoryId: string, data: CategoryWriteData): Promise<Category> =>
  prisma.category.update({
    where: { categoryId },
    data: { ...data, isDeleted: false, isDisabled: false },
  });

export const updateCategory = (categoryId: string, data: CategoryWriteData): Promise<Category> =>
  prisma.category.update({ where: { categoryId }, data });

// Deleting a category also hides its products — otherwise they'd remain visible
// while pointing at a category that no longer officially exists.
export const softDeleteCategory = (categoryId: string): Promise<Category> =>
  prisma.$transaction(async (tx) => {
    const category = await tx.category.update({ where: { categoryId }, data: { isDeleted: true } });
    await tx.product.updateMany({ where: { categoryId, isDeleted: false }, data: { isDisabled: true } });
    return category;
  }) as Promise<Category>;

export const setCategoryDisabled = (categoryId: string, isDisabled: boolean) =>
  prisma.$transaction([
    prisma.category.update({ where: { categoryId }, data: { isDisabled } }),
    prisma.product.updateMany({ where: { categoryId, isDeleted: false }, data: { isDisabled } }),
  ]);

export const countActiveCategories = (): Promise<number> =>
  prisma.category.count({ where: { isDeleted: false, isDisabled: false } });
