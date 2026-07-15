import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as wishlistService from "@services/wishlist.service";

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const productId = req.params["productId"] as string;
  await wishlistService.addToWishlist(userId, productId);
  sendSuccess(res, { message: "Product added to wishlist." }, 201);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const productId = req.params["productId"] as string;
  await wishlistService.removeFromWishlist(userId, productId);
  sendSuccess(res, { message: "Product removed from wishlist." });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const items = await wishlistService.getWishlist(userId);
  sendSuccess(res, items);
});

export const checkWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const productId = req.params["productId"] as string;
  const result = await wishlistService.checkWishlist(userId, productId);
  sendSuccess(res, result);
});
