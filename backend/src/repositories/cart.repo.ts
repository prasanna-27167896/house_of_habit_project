import { prisma } from "@lib/prisma";
import type {
  Cart,
  CartItem,
  CartWithItems,
  CartItemWithDetails,
  CartItemForUpdate,
  VariantWithProduct,
} from "@interfaces/cart.types";

export const cartItemSelect = {
  cartItemId: true,
  quantity: true,
  createdAt: true,
  variant: {
    select: {
      variantId: true,
      size: true,
      color: true,
      colorCode: true,
      sku: true,
      stock: true,
      price: true,
      isActive: true,
      product: {
        select: {
          productId: true,
          title: true,
          price: true,
          discountedPrice: true,
          discountPercentage: true,
          imageUrl: true,
          isDisabled: true,
          isDeleted: true,
          category: { select: { categoryId: true, categoryTitle: true } },
          brand: { select: { brandId: true, brandName: true } },
        },
      },
    },
  },
} as const;

export const findCartWithItems = (userId: string): Promise<CartWithItems | null> =>
  prisma.cart.findUnique({
    where: { userId },
    select: {
      cartId: true,
      updatedAt: true,
      items: { select: cartItemSelect, orderBy: { createdAt: "desc" } },
    },
  }) as Promise<CartWithItems | null>;

export const findRawCart = (userId: string): Promise<Cart | null> =>
  prisma.cart.findUnique({ where: { userId } });

export const createCart = (userId: string): Promise<Cart> =>
  prisma.cart.create({ data: { userId } });

export const findVariantWithProduct = (variantId: string): Promise<VariantWithProduct | null> =>
  prisma.productVariant.findUnique({
    where: { variantId },
    include: { product: { select: { isDeleted: true, isDisabled: true } } },
  });

export const findCartItemByComposite = (cartId: string, variantId: string): Promise<CartItem | null> =>
  prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

export const findCartItemForUpdate = (cartItemId: string, userId: string): Promise<CartItemForUpdate | null> =>
  prisma.cartItem.findFirst({
    where: { cartItemId, cart: { userId } },
    include: {
      variant: {
        select: {
          stock: true,
          isActive: true,
          product: { select: { isDisabled: true, isDeleted: true } },
        },
      },
    },
  });

export const findCartItemOwned = (cartItemId: string, userId: string): Promise<CartItem | null> =>
  prisma.cartItem.findFirst({ where: { cartItemId, cart: { userId } } });

export const createCartItem = (cartId: string, variantId: string, quantity: number): Promise<CartItemWithDetails> =>
  prisma.cartItem.create({
    data: { cartId, variantId, quantity },
    select: cartItemSelect,
  }) as Promise<CartItemWithDetails>;

export const updateCartItemQuantity = (cartItemId: string, quantity: number): Promise<CartItemWithDetails> =>
  prisma.cartItem.update({
    where: { cartItemId },
    data: { quantity },
    select: cartItemSelect,
  }) as Promise<CartItemWithDetails>;

export const deleteCartItem = (cartItemId: string) =>
  prisma.cartItem.delete({ where: { cartItemId } });

export const deleteAllCartItems = (cartId: string) =>
  prisma.cartItem.deleteMany({ where: { cartId } });
