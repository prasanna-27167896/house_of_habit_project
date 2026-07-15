import { AppError } from "@utils/AppError";

export const UserErrors = {
  USER_NOT_FOUND: () =>
    new AppError("User not found.", 404, "USER_NOT_FOUND"),
  INVALID_PASSWORD: () =>
    new AppError("Current password is incorrect.", 400, "INVALID_PASSWORD"),
  CANNOT_LOCK_SELF: () =>
    new AppError("You cannot lock your own account.", 403, "CANNOT_LOCK_SELF"),
  CANNOT_LOCK_ADMIN: () =>
    new AppError("You cannot lock another admin account.", 403, "CANNOT_LOCK_ADMIN"),
};
