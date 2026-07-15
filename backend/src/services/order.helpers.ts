import * as faqRepo from "@repos/faq.repo";
import * as addressRepo from "@repos/address.repo";
import { Errors } from "@errors/index";
import type { OrderItemCreateData } from "@interfaces/order.types";
import type { CouponWithRelations } from "@interfaces/coupon.types";
import type { CartItemWithDetails } from "@interfaces/cart.types";
import type { Address } from "@interfaces/address.types";

// Resolve the delivery address for a checkout: the one the user picked, or their
// default when none is given. Throws if neither exists.
export const resolveDeliveryAddress = async (
  userId: string,
  addressId?: string,
): Promise<Address> => {
  const address = addressId
    ? await addressRepo.findAddressById(addressId, userId)
    : await addressRepo.findDefaultAddress(userId);
  if (!address) throw Errors.ADDRESS_NOT_FOUND();
  return address;
};

// Shared cart → order calculations used by both order.service and payment.service.
// Single source of truth — these must stay identical across the COD and Razorpay flows.

// Reject the checkout if any item became unavailable or is short on stock.
export const validateItemAvailability = (items: CartItemWithDetails[]): void => {
  for (const item of items) {
    if (!item.variant.isActive || item.variant.product.isDisabled || item.variant.product.isDeleted) {
      throw Errors.PRODUCT_UNAVAILABLE();
    }
    if (item.variant.stock < item.quantity) {
      throw Errors.OUT_OF_STOCK(item.variant.product.title, item.variant.stock);
    }
  }
};

// Line totals before coupon/shipping. `discount` is the product-level markdown.
export const calcTotals = (items: CartItemWithDetails[]) => {
  let totalPrice = 0;
  let totalDiscountedPrice = 0;
  for (const item of items) {
    totalPrice += item.variant.product.price * item.quantity;
    const effective = item.variant.price ?? item.variant.product.discountedPrice;
    totalDiscountedPrice += effective * item.quantity;
  }
  return { totalPrice, totalDiscountedPrice, discount: totalPrice - totalDiscountedPrice };
};

// Scope-aware coupon discount (CART / CATEGORY / PRODUCT), capped at maxDiscount and base.
export const calcCouponDiscount = (
  coupon: CouponWithRelations,
  items: CartItemWithDetails[],
  totalDiscountedPrice: number,
): number => {
  let base = 0;

  if (coupon.couponScope === "CART") {
    base = totalDiscountedPrice;
  } else if (coupon.couponScope === "CATEGORY" && coupon.categoryId != null) {
    base = items
      .filter((i) => i.variant.product.category.categoryId === coupon.categoryId)
      .reduce((s, i) => s + (i.variant.price ?? i.variant.product.discountedPrice) * i.quantity, 0);
  } else if (coupon.couponScope === "PRODUCT" && coupon.productId != null) {
    base = items
      .filter((i) => i.variant.product.productId === coupon.productId)
      .reduce((s, i) => s + (i.variant.price ?? i.variant.product.discountedPrice) * i.quantity, 0);
  }

  if (base === 0) return 0;

  let discount = coupon.couponType === "PERCENTAGE" ? (base * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, base);

  // Round to a whole rupee. Product prices are integers and shipping is admin-configured,
  // so the coupon discount is the only place a fractional amount could enter an order.
  // Keeping it integral means every stored money value stays a whole number, which sidesteps
  // Float rounding drift downstream (paise conversion, refund amounts, reports) until money
  // columns are migrated to integer paise / Decimal.
  return Math.round(discount);
};

// Snapshot cart items into order-item rows (title/size/color/price captured at order time).
export const buildOrderItems = (items: CartItemWithDetails[]): OrderItemCreateData[] =>
  items.map((item) => ({
    variantId: item.variant.variantId,
    productTitle: item.variant.product.title,
    size: item.variant.size,
    color: item.variant.color,
    imageUrl: item.variant.product.imageUrl ?? null,
    quantity: item.quantity,
    price: item.variant.product.price,
    discountedPrice: item.variant.price ?? item.variant.product.discountedPrice,
  }));

// Shipping charge from StoreInfo (free above threshold; 0 when no StoreInfo configured).
export const resolveShippingCharge = async (orderAmount: number): Promise<number> => {
  const storeInfo = await faqRepo.findStoreInfo();
  if (!storeInfo) return 0;
  if (storeInfo.freeShippingAbove != null && orderAmount >= storeInfo.freeShippingAbove) return 0;
  return storeInfo.shippingCharge;
};
