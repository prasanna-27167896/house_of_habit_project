import type { Address, AddressType } from "@generated/prisma/client";

export type { Address, AddressType };

export type AddressWriteData = {
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: AddressType;
  isDefault: boolean;
};

export type AddressUpdateData = Omit<AddressWriteData, "userId">;
