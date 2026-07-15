import { AppError } from "@utils/AppError";

export const WishlistErrors = {
  ALREADY_IN_WISHLIST: () =>
    new AppError("Product is already in your wishlist.", 409, "ALREADY_IN_WISHLIST"),
  NOT_IN_WISHLIST: () =>
    new AppError("Product is not in your wishlist.", 404, "NOT_IN_WISHLIST"),
};
