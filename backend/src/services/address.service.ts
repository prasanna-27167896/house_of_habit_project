import * as addressRepo from "@repos/address.repo";
import { Errors } from "@errors/index";
import type { Address } from "@interfaces/address.types";
import type { CreateAddressInput, UpdateAddressInput } from "@validators/address.schema";

// A user may save at most this many addresses.
const MAX_ADDRESSES = 5;

export const getAddresses = async (userId: string): Promise<Address[]> =>
  addressRepo.findAddressesByUser(userId);

export const getAddressById = async (userId: string, addressId: string): Promise<Address> => {
  const address = await addressRepo.findAddressById(addressId, userId);
  if (!address) throw Errors.ADDRESS_NOT_FOUND();
  return address;
};

export const createAddress = async (userId: string, input: CreateAddressInput): Promise<Address> => {
  const duplicate = await addressRepo.findDuplicateAddress(userId, input.addressLine1, input.pincode);
  if (duplicate) throw Errors.ADDRESS_ALREADY_EXISTS();

  const count = await addressRepo.countUserAddresses(userId);
  if (count >= MAX_ADDRESSES) throw Errors.ADDRESS_LIMIT_REACHED();

  // The very first address is always the default; after that, only if requested.
  const shouldBeDefault = count === 0 || input.isDefault === true;

  return addressRepo.createAddress({
    userId,
    fullName: input.fullName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2 ?? null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country,
    addressType: input.addressType,
    isDefault: shouldBeDefault,
  });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  input: UpdateAddressInput,
): Promise<Address> => {
  const address = await addressRepo.findAddressById(addressId, userId);
  if (!address) throw Errors.ADDRESS_NOT_FOUND();

  // Invariant: there's always exactly one default. The default flag can only be
  // turned ON (here or via PATCH /:id/default). An attempt to un-default the current
  // default is ignored — you change the default by setting another address as default.
  const makeDefault = input.isDefault === true || address.isDefault;

  return addressRepo.updateAddress(addressId, userId, {
    fullName: input.fullName ?? address.fullName,
    phone: input.phone ?? address.phone,
    addressLine1: input.addressLine1 ?? address.addressLine1,
    addressLine2: input.addressLine2 !== undefined ? input.addressLine2 : address.addressLine2,
    city: input.city ?? address.city,
    state: input.state ?? address.state,
    pincode: input.pincode ?? address.pincode,
    country: input.country ?? address.country,
    addressType: input.addressType ?? address.addressType,
    isDefault: makeDefault,
  });
};

export const setDefaultAddress = async (userId: string, addressId: string): Promise<void> => {
  const address = await addressRepo.findAddressById(addressId, userId);
  if (!address) throw Errors.ADDRESS_NOT_FOUND();

  await addressRepo.setDefaultAddressTransaction(userId, addressId);
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  const address = await addressRepo.findAddressById(addressId, userId);
  if (!address) throw Errors.ADDRESS_NOT_FOUND();

  // An address referenced by an order must stay — orders keep their shipping snapshot.
  const orderCount = await addressRepo.countOrdersForAddress(addressId);
  if (orderCount > 0) throw Errors.ADDRESS_IN_USE();

  // Delete and, if this was the default, promote another — atomically, so the user is
  // never left with zero defaults.
  await addressRepo.deleteAddressWithPromotion(addressId, userId, address.isDefault);
};
