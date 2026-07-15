import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as brandService from "@services/brand.service";
import { createBrandSchema, updateBrandSchema } from "@validators/brand.schema";

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const input = createBrandSchema.parse(req.body);
  const brand = await brandService.createBrand(input);
  sendSuccess(res, brand, 201);
});

export const getAllBrands = asyncHandler(async (_req: Request, res: Response) => {
  const brands = await brandService.getAllBrands();
  sendSuccess(res, brands);
});

export const getBrandsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params["categoryId"] as string;
  const brands = await brandService.getBrandsByCategory(categoryId);
  sendSuccess(res, brands);
});

export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.params["brandId"] as string;
  const brand = await brandService.getBrandById(brandId);
  sendSuccess(res, brand);
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.params["brandId"] as string;
  const input = updateBrandSchema.parse(req.body);
  const brand = await brandService.updateBrand(brandId, input);
  sendSuccess(res, brand);
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const brandId = req.params["brandId"] as string;
  const { affectedProducts } = await brandService.deleteBrand(brandId);
  const message =
    affectedProducts > 0
      ? `Brand deleted. ${affectedProducts} product(s) had their brand removed.`
      : "Brand deleted successfully.";
  sendSuccess(res, { message, affectedProducts });
});
