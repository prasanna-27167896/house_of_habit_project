import type { Prisma } from "@generated/prisma/client";

// Wishlist product — fields selected by the wishlist query
export type WishlistProduct = Prisma.ProductGetPayload<{
  select: {
    productId: true;
    title: true;
    price: true;
    discountedPrice: true;
    discountPercentage: true;
    imageUrl: true;
    gender: true;
    season: true;
    isDisabled: true;
    isDeleted: true;
    category: { select: { categoryId: true; categoryTitle: true } };
    brand: { select: { brandId: true; brandName: true } };
    variants: {
      select: { variantId: true; size: true; color: true; colorCode: true; stock: true; price: true };
    };
  };
}>;

// Raw repo row returned by findWishlistByUser
export type WishlistRow = {
  createdAt: Date;
  product: WishlistProduct;
};

// What getWishlist returns to the client (product fields + addedAt)
export type WishlistItemResult = WishlistProduct & { addedAt: Date };

export type WishlistCheckResult = { inWishlist: boolean };
