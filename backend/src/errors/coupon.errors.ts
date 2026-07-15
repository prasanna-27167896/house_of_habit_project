import { AppError } from "@utils/AppError";

export const CouponErrors = {
  COUPON_NOT_FOUND: () =>
    new AppError("Coupon not found.", 404, "COUPON_NOT_FOUND"),
  COUPON_CODE_ALREADY_EXISTS: (code: string) =>
    new AppError(`Coupon code '${code}' already exists.`, 409, "COUPON_CODE_ALREADY_EXISTS"),
  COUPON_INACTIVE: () =>
    new AppError("This coupon is currently inactive.", 400, "COUPON_INACTIVE"),
  COUPON_EXPIRED: () =>
    new AppError("This coupon has expired.", 400, "COUPON_EXPIRED"),
  COUPON_NOT_YET_VALID: () =>
    new AppError("This coupon is not yet valid.", 400, "COUPON_NOT_YET_VALID"),
  COUPON_USAGE_LIMIT_REACHED: () =>
    new AppError("This coupon has reached its usage limit.", 400, "COUPON_USAGE_LIMIT_REACHED"),
  COUPON_USER_LIMIT_REACHED: () =>
    new AppError("You have already used this coupon the maximum number of times.", 400, "COUPON_USER_LIMIT_REACHED"),
  COUPON_HAS_REDEMPTIONS: () =>
    new AppError(
      "This coupon has been used and cannot be deleted (its redemption history must be preserved). Deactivate it instead.",
      409,
      "COUPON_HAS_REDEMPTIONS",
    ),
};
