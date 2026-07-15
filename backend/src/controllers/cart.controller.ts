import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as cartService from "@services/cart.service";
import { addToCartSchema, updateCartItemSchema } from "@validators/cart.schema";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const result = await cartService.getCart(req.user!.userId);
  sendSuccess(res, result);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const input = addToCartSchema.parse(req.body);
  const item = await cartService.addToCart(req.user!.userId, input);
  sendSuccess(res, item, 201);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cartItemId = req.params["cartItemId"] as string;
  const input = updateCartItemSchema.parse(req.body);
  const item = await cartService.updateCartItem(req.user!.userId, cartItemId, input);
  sendSuccess(res, item);
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const cartItemId = req.params["cartItemId"] as string;
  await cartService.removeFromCart(req.user!.userId, cartItemId);
  sendSuccess(res, { message: "Item removed from cart." });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await cartService.clearCart(req.user!.userId);
  sendSuccess(res, { message: "Cart cleared." });
});
