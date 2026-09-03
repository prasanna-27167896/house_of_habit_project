import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as productService from "@services/product.service";
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  productListSchema,
  productSearchSchema,
  bestSellingQuerySchema,
} from "@validators/product.schema";

// ─── Product ──────────────────────────────────────────────────────────────────

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(input);
  sendSuccess(res, product, 201);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const input = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(productId, input);
  sendSuccess(res, product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  await productService.deleteProduct(productId);
  sendSuccess(res, { message: "Product deleted successfully." });
});

export const toggleProductDisable = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const result = await productService.toggleProductDisable(productId);
  const message = result.isDisabled ? "Product disabled successfully." : "Product enabled successfully.";
  sendSuccess(res, { message, isDisabled: result.isDisabled });
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = productListSchema.parse(req.query);
  const result = await productService.getAllProducts(query);
  sendSuccess(res, result);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const product = await productService.getProductById(productId);
  sendSuccess(res, product);
});

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.params["categoryId"] as string;
  const query = productListSchema.parse(req.query);
  const result = await productService.getProductsByCategory(categoryId, query);
  sendSuccess(res, result);
});

export const getBestSellingProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = bestSellingQuerySchema.parse(req.query);
  const products = await productService.getBestSellingProducts(query.limit);
  sendSuccess(res, products);
});

export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = productSearchSchema.parse(req.query);
  const result = await productService.searchProducts(query);
  sendSuccess(res, result);
});

export const getProductsGroupedByCategory = asyncHandler(async (_req: Request, res: Response) => {
  const result = await productService.getProductsGroupedByCategory();
  sendSuccess(res, result);
});

// ─── Variants ─────────────────────────────────────────────────────────────────

export const addVariant = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const input = createVariantSchema.parse(req.body);
  const variant = await productService.addVariant(productId, input);
  sendSuccess(res, variant, 201);
});

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const variantId = req.params["variantId"] as string;
  const input = updateVariantSchema.parse(req.body);
  const variant = await productService.updateVariant(productId, variantId, input);
  sendSuccess(res, variant);
});

export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params["productId"] as string;
  const variantId = req.params["variantId"] as string;
  await productService.deleteVariant(productId, variantId);
  sendSuccess(res, { message: "Variant deleted successfully." });
});
