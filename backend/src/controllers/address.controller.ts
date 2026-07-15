import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as addressService from "@services/address.service";
import { createAddressSchema, updateAddressSchema } from "@validators/address.schema";

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await addressService.getAddresses(req.user!.userId);
  sendSuccess(res, addresses);
});

export const getAddressById = asyncHandler(async (req: Request, res: Response) => {
  const addressId = req.params["addressId"] as string;
  const address = await addressService.getAddressById(req.user!.userId, addressId);
  sendSuccess(res, address);
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const input = createAddressSchema.parse(req.body);
  const address = await addressService.createAddress(req.user!.userId, input);
  sendSuccess(res, address, 201);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = req.params["addressId"] as string;
  const input = updateAddressSchema.parse(req.body);
  const address = await addressService.updateAddress(req.user!.userId, addressId, input);
  sendSuccess(res, address);
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = req.params["addressId"] as string;
  await addressService.setDefaultAddress(req.user!.userId, addressId);
  sendSuccess(res, { message: "Default address updated." });
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const addressId = req.params["addressId"] as string;
  await addressService.deleteAddress(req.user!.userId, addressId);
  sendSuccess(res, { message: "Address deleted." });
});
