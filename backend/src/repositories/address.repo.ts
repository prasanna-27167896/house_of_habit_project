import { prisma } from "@lib/prisma";
import type { Address, AddressWriteData, AddressUpdateData } from "@interfaces/address.types";

export const findAddressesByUser = (userId: string): Promise<Address[]> =>
  prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

export const findAddressById = (addressId: string, userId: string): Promise<Address | null> =>
  prisma.address.findFirst({ where: { addressId, userId } });

export const countUserAddresses = (userId: string): Promise<number> =>
  prisma.address.count({ where: { userId } });

export const findDuplicateAddress = (
  userId: string,
  addressLine1: string,
  pincode: string,
): Promise<Address | null> =>
  prisma.address.findFirst({
    where: {
      userId,
      addressLine1: { equals: addressLine1, mode: "insensitive" },
      pincode,
    },
  });

// Creating a default address atomically clears the previous default first, so the
// account is never left with zero (or two) defaults even if a step fails.
export const createAddress = (data: AddressWriteData): Promise<Address> => {
  if (!data.isDefault) return prisma.address.create({ data });
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId: data.userId }, data: { isDefault: false } });
    return tx.address.create({ data });
  }) as Promise<Address>;
};

// Same atomic guarantee when an update promotes this address to default.
export const updateAddress = (
  addressId: string,
  userId: string,
  data: AddressUpdateData,
): Promise<Address> => {
  if (!data.isDefault) return prisma.address.update({ where: { addressId }, data });
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { addressId }, data });
  }) as Promise<Address>;
};

export const findDefaultAddress = (userId: string): Promise<Address | null> =>
  prisma.address.findFirst({ where: { userId, isDefault: true } });

export const countOrdersForAddress = (addressId: string): Promise<number> =>
  prisma.order.count({ where: { shippingAddressId: addressId } });

// Delete an address; if it was the default, promote the most recent remaining one — all
// in one transaction so the "exactly one default" invariant can't break midway (the
// account is never left with zero defaults even if a step fails).
export const deleteAddressWithPromotion = (
  addressId: string,
  userId: string,
  wasDefault: boolean,
): Promise<void> =>
  prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { addressId } });
    if (wasDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await tx.address.update({
          where: { addressId: next.addressId },
          data: { isDefault: true },
        });
      }
    }
  }).then(() => undefined);

export const setDefaultAddressTransaction = (userId: string, addressId: string) =>
  prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { addressId }, data: { isDefault: true } }),
  ]);
