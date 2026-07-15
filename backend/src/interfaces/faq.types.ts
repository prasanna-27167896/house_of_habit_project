import type { Faq, StoreInfo } from "@generated/prisma/client";

export type { Faq, StoreInfo };

// ─── FAQ write data ───────────────────────────────────────────────────────────

export type FaqWriteData = {
  question: string;
  answer: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type FaqUpdateData = {
  question?: string;
  answer?: string;
  isActive?: boolean;
  displayOrder?: number;
};

// ─── StoreInfo write data ─────────────────────────────────────────────────────

export type StoreInfoWriteData = {
  storeName: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  website: string | null;
  openingTime: string | null;
  closingTime: string | null;
  description: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  shippingCharge: number;
  freeShippingAbove: number | null;
};
