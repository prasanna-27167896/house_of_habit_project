import * as cartRepo from "@repos/cart.repo";
import { Errors } from "@errors/index";
import type { CartResult, CartItemWithDetails } from "@interfaces/cart.types";
import type { AddToCartInput, UpdateCartItemInput } from "@validators/cart.schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getOrCreateCart = async (userId: string) => {
  const existing = await cartRepo.findRawCart(userId);
  if (existing) return existing;
  return cartRepo.createCart(userId);
};

// Prisma unique-constraint violation (P2002) — duck-typed so the service stays free of
// a direct Prisma import.
const isUniqueViolation = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";

// A cart item is available to buy only if its variant is active, its product is
// still visible, and there's enough stock for the requested quantity.
const isItemAvailable = (item: CartItemWithDetails): boolean =>
  item.variant.isActive &&
  !item.variant.product.isDisabled &&
  !item.variant.product.isDeleted &&
  item.variant.stock >= item.quantity;

// ─── Service ──────────────────────────────────────────────────────────────────

export const getCart = async (userId: string): Promise<CartResult> => {
  const cart = await cartRepo.findCartWithItems(userId);

  if (!cart) {
    return { cartId: null, items: [], subtotal: 0, totalItems: 0, hasUnavailableItems: false };
  }

  const items = cart.items.map((item) => ({ ...item, isAvailable: isItemAvailable(item) }));

  // Subtotal reflects only what the customer can actually buy right now.
  const subtotal = items.reduce((sum, item) => {
    if (!item.isAvailable) return sum;
    const unitPrice = item.variant.price ?? item.variant.product.discountedPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const hasUnavailableItems = items.some((item) => !item.isAvailable);

  return { cartId: cart.cartId, items, subtotal, totalItems: items.length, hasUnavailableItems };
};

export const addToCart = async (userId: string, input: AddToCartInput): Promise<CartItemWithDetails> => {
  const variant = await cartRepo.findVariantWithProduct(input.variantId);

  if (!variant) throw Errors.VARIANT_NOT_FOUND();
  if (!variant.isActive) throw Errors.VARIANT_INACTIVE();
  if (variant.product.isDeleted || variant.product.isDisabled) throw Errors.PRODUCT_UNAVAILABLE();
  if (variant.stock < input.quantity) throw Errors.INSUFFICIENT_STOCK(variant.stock);

  const cart = await getOrCreateCart(userId);

  // Add input.quantity onto an existing line, capped at available stock.
  const mergeInto = (cartItemId: string, currentQty: number): Promise<CartItemWithDetails> => {
    const newQty = currentQty + input.quantity;
    if (variant.stock < newQty) throw Errors.INSUFFICIENT_STOCK(variant.stock);
    return cartRepo.updateCartItemQuantity(cartItemId, newQty);
  };

  const existingItem = await cartRepo.findCartItemByComposite(cart.cartId, input.variantId);
  if (existingItem) return mergeInto(existingItem.cartItemId, existingItem.quantity);

  try {
    return await cartRepo.createCartItem(cart.cartId, input.variantId, input.quantity);
  } catch (err) {
    // A concurrent add (double-tap / retry) inserted the row between our check and this
    // create, tripping the @@unique([cartId, variantId]) constraint. Re-fetch and merge
    // instead of surfacing a raw 409.
    if (isUniqueViolation(err)) {
      const raced = await cartRepo.findCartItemByComposite(cart.cartId, input.variantId);
      if (raced) return mergeInto(raced.cartItemId, raced.quantity);
    }
    throw err;
  }
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  input: UpdateCartItemInput,
): Promise<CartItemWithDetails> => {
  const item = await cartRepo.findCartItemForUpdate(cartItemId, userId);

  if (!item) throw Errors.CART_ITEM_NOT_FOUND();
  if (!item.variant.isActive) throw Errors.VARIANT_INACTIVE();
  // Same availability rules as addToCart — a disabled/deleted product can't be updated either.
  if (item.variant.product.isDisabled || item.variant.product.isDeleted) throw Errors.PRODUCT_UNAVAILABLE();
  if (item.variant.stock < input.quantity) throw Errors.INSUFFICIENT_STOCK(item.variant.stock);

  return cartRepo.updateCartItemQuantity(cartItemId, input.quantity);
};

export const removeFromCart = async (userId: string, cartItemId: string): Promise<void> => {
  const item = await cartRepo.findCartItemOwned(cartItemId, userId);
  if (!item) throw Errors.CART_ITEM_NOT_FOUND();

  await cartRepo.deleteCartItem(cartItemId);
};

export const clearCart = async (userId: string): Promise<void> => {
  const cart = await cartRepo.findRawCart(userId);
  if (!cart) return;
  await cartRepo.deleteAllCartItems(cart.cartId);
};
