import * as wishlistRepo from "@repos/wishlist.repo";
import * as productRepo from "@repos/product.repo";
import { Errors } from "@errors/index";
import type { WishlistItemResult, WishlistCheckResult } from "@interfaces/wishlist.types";

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  const product = await productRepo.findVisibleProduct(productId);
  if (!product) throw Errors.PRODUCT_NOT_FOUND();

  const existing = await wishlistRepo.findWishlistItem(userId, productId);
  if (existing) throw Errors.ALREADY_IN_WISHLIST();

  await wishlistRepo.createWishlistItem(userId, productId);
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  const existing = await wishlistRepo.findWishlistItem(userId, productId);
  if (!existing) throw Errors.NOT_IN_WISHLIST();

  await wishlistRepo.deleteWishlistItem(userId, productId);
};

export const getWishlist = async (userId: string): Promise<WishlistItemResult[]> => {
  const items = await wishlistRepo.findWishlistByUser(userId);
  return items.map((item) => ({ ...item.product, addedAt: item.createdAt }));
};

export const checkWishlist = async (userId: string, productId: string): Promise<WishlistCheckResult> => {
  const item = await wishlistRepo.findWishlistItem(userId, productId);
  return { inWishlist: item !== null };
};
