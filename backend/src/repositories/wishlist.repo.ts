import { prisma } from "@lib/prisma";
import type { WishlistRow } from "@interfaces/wishlist.types";

const wishlistProductSelect = {
  productId: true,
  title: true,
  price: true,
  discountedPrice: true,
  discountPercentage: true,
  imageUrl: true,
  gender: true,
  season: true,
  isDisabled: true,
  isDeleted: true,
  category: { select: { categoryId: true, categoryTitle: true } },
  brand: { select: { brandId: true, brandName: true } },
  variants: {
    where: { isActive: true },
    select: { variantId: true, size: true, color: true, colorCode: true, stock: true, price: true },
  },
} as const;

export const findWishlistItem = (userId: string, productId: string) =>
  prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } });

export const findWishlistByUser = (userId: string): Promise<WishlistRow[]> =>
  prisma.wishlist.findMany({
    // Only surface products that still exist and are visible — no "ghost" items.
    where: { userId, product: { isDeleted: false, isDisabled: false } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, product: { select: wishlistProductSelect } },
  }) as Promise<WishlistRow[]>;

export const createWishlistItem = (userId: string, productId: string) =>
  prisma.wishlist.create({ data: { userId, productId } });

export const deleteWishlistItem = (userId: string, productId: string) =>
  prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
