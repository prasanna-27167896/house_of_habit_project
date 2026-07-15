import type { Prisma, Cart, CartItem } from "@generated/prisma/client";

export type { Cart, CartItem };

export type VariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: { product: { select: { isDeleted: true; isDisabled: true } } };
}>;

export type CartItemWithDetails = {
  cartItemId: string;
  quantity: number;
  createdAt: Date;
  variant: {
    variantId: string;
    size: string;
    color: string;
    colorCode: string | null;
    sku: string;
    stock: number;
    price: number | null;
    isActive: boolean;
    product: {
      productId: string;
      title: string;
      price: number;
      discountedPrice: number;
      discountPercentage: number | null;
      imageUrl: string | null;
      isDisabled: boolean;
      isDeleted: boolean;
      category: { categoryId: string; categoryTitle: string };
      brand: { brandId: string; brandName: string } | null;
    };
  };
};

export type CartItemForUpdate = Prisma.CartItemGetPayload<{
  include: {
    variant: {
      select: {
        stock: true;
        isActive: true;
        product: { select: { isDisabled: true; isDeleted: true } };
      };
    };
  };
}>;

export type CartWithItems = {
  cartId: string;
  updatedAt: Date;
  items: CartItemWithDetails[];
};

// A cart item enriched with a live availability flag (variant active + product
// visible + enough stock). Unavailable items are shown but excluded from subtotal.
export type CartItemResult = CartItemWithDetails & { isAvailable: boolean };

export type CartResult = {
  cartId: string | null;
  items: CartItemResult[];
  subtotal: number;
  totalItems: number;
  hasUnavailableItems: boolean;
};
