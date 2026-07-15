import { AppError } from "@utils/AppError";

export const CategoryErrors = {
  CATEGORY_NOT_FOUND: () =>
    new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND"),
  CATEGORY_ALREADY_EXISTS: (title: string) =>
    new AppError(`Category '${title}' already exists.`, 409, "CATEGORY_ALREADY_EXISTS"),
};
