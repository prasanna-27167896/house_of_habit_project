import * as categoryRepo from "@repos/category.repo";
import { Errors } from "@errors/index";
import { deleteFromPublicR2 } from "@services/cloudflare.service";
import type { Category } from "@interfaces/category.types";
import type { CreateCategoryInput, UpdateCategoryInput } from "@validators/category.schema";

export const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
  const existing = await categoryRepo.findCategoryByTitle(input.categoryTitle);
  if (existing && !existing.isDeleted) throw Errors.CATEGORY_ALREADY_EXISTS(input.categoryTitle);

  const data = {
    categoryTitle: input.categoryTitle,
    categoryDescription: input.categoryDescription ?? null,
    imageUrl: input.imageUrl ?? null,
    imageKey: input.imageKey ?? null,
  };

  // A soft-deleted category with this (unique) title exists → revive it with the new details.
  if (existing?.isDeleted) return categoryRepo.reviveCategory(existing.categoryId, data);

  return categoryRepo.createCategory(data);
};

export const updateCategory = async (categoryId: string, input: UpdateCategoryInput): Promise<Category> => {
  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) throw Errors.CATEGORY_NOT_FOUND();

  // Snapshot the old image key; delete it only AFTER the DB update succeeds (deletion is
  // irreversible — doing it first would leave the row pointing at a missing object).
  const oldImageKey =
    input.imageKey && input.imageKey !== category.imageKey ? category.imageKey : null;

  const updated = await categoryRepo.updateCategory(categoryId, {
    categoryTitle: input.categoryTitle ?? category.categoryTitle,
    categoryDescription: input.categoryDescription ?? category.categoryDescription,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : category.imageUrl,
    imageKey: input.imageKey !== undefined ? input.imageKey : category.imageKey,
  });

  if (oldImageKey) await deleteFromPublicR2(oldImageKey).catch(() => undefined);

  return updated;
};

export const deleteCategory = async (categoryTitle: string): Promise<void> => {
  const category = await categoryRepo.findCategoryByTitle(categoryTitle);
  if (!category || category.isDeleted) throw Errors.CATEGORY_NOT_FOUND();

  await categoryRepo.softDeleteCategory(category.categoryId);
};

export const getCategory = async (categoryId: string): Promise<Category> => {
  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) throw Errors.CATEGORY_NOT_FOUND();
  return category;
};

export const getAllCategories = async (): Promise<Category[]> =>
  categoryRepo.findAllActiveCategories();

export const toggleCategoryDisable = async (categoryId: string, disable: boolean): Promise<void> => {
  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) throw Errors.CATEGORY_NOT_FOUND();

  await categoryRepo.setCategoryDisabled(categoryId, disable);
};
