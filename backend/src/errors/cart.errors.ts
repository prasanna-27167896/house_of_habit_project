import { AppError } from "@utils/AppError";

export const CartErrors = {
  CART_ITEM_NOT_FOUND: () =>
    new AppError("Cart item not found.", 404, "CART_ITEM_NOT_FOUND"),
  INSUFFICIENT_STOCK: (available: number) =>
    new AppError(`Only ${available} unit(s) in stock.`, 400, "INSUFFICIENT_STOCK"),
};
