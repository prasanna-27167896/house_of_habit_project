import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as categoryService from "@services/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  toggleCategorySchema,
} from "@validators/category.schema";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  sendSuccess(res, category, 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params["categoryId"] as string;
  const input = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(categoryId, input);
  sendSuccess(res, category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryTitle } = req.params as { categoryTitle: string };
  await categoryService.deleteCategory(categoryTitle);
  sendSuccess(res, { message: "Category deleted successfully." });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params["categoryId"] as string;
  const category = await categoryService.getCategory(categoryId);
  sendSuccess(res, category);
});

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  sendSuccess(res, categories);
});

export const toggleCategoryDisable = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params["categoryId"] as string;
  const { status } = toggleCategorySchema.parse({ status: req.query["status"] });
  const disable = status === "true";
  await categoryService.toggleCategoryDisable(categoryId, disable);
  const message = disable
    ? "Category disabled successfully."
    : "Category enabled successfully.";
  sendSuccess(res, { message });
});
