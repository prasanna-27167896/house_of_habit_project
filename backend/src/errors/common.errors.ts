import { AppError } from "@utils/AppError";

export const CommonErrors = {
  FORBIDDEN: () =>
    new AppError("You do not have permission to perform this action.", 403, "FORBIDDEN"),
  NOT_FOUND: () =>
    new AppError("Resource not found.", 404, "NOT_FOUND"),
  INTERNAL_SERVER_ERROR: () =>
    new AppError("Something went wrong. Please try again later.", 500, "INTERNAL_SERVER_ERROR"),
};
