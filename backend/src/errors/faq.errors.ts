import { AppError } from "@utils/AppError";

export const FaqErrors = {
  FAQ_NOT_FOUND: () => new AppError("FAQ not found.", 404, "FAQ_NOT_FOUND"),
  STORE_INFO_NOT_FOUND: () => new AppError("Store info has not been configured yet.", 404, "STORE_INFO_NOT_FOUND"),
};
