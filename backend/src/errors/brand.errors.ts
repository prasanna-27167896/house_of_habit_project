import { AppError } from "@utils/AppError";

export const BrandErrors = {
  BRAND_NOT_FOUND: () =>
    new AppError("Brand not found.", 404, "BRAND_NOT_FOUND"),
};
