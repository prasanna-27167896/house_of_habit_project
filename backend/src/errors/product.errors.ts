import { AppError } from "@utils/AppError";

export const ProductErrors = {
  PRODUCT_NOT_FOUND: () =>
    new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND"),
  PRODUCT_UNAVAILABLE: () =>
    new AppError("Product is not available.", 400, "PRODUCT_UNAVAILABLE"),
  VARIANT_NOT_FOUND: () =>
    new AppError("Variant not found.", 404, "VARIANT_NOT_FOUND"),
  VARIANT_INACTIVE: () =>
    new AppError("This variant is no longer available.", 400, "VARIANT_INACTIVE"),
  SKU_ALREADY_EXISTS: (sku: string) =>
    new AppError(`SKU '${sku}' already exists.`, 409, "SKU_ALREADY_EXISTS"),
  INVALID_PRICING: () =>
    new AppError("Discounted price cannot exceed the original price.", 400, "INVALID_PRICING"),
  VARIANT_IN_USE: () =>
    new AppError("This variant is used by an order and cannot be deleted. Deactivate it instead.", 409, "VARIANT_IN_USE"),
};
