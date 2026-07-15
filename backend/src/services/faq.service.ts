import * as faqRepo from "@repos/faq.repo";
import { Errors } from "@errors/index";
import type { Faq, StoreInfo } from "@interfaces/faq.types";
import type { CreateFaqInput, UpdateFaqInput, UpsertStoreInfoInput } from "@validators/faq.schema";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const getActiveFaqs = (): Promise<Faq[]> => faqRepo.findActiveFaqs();

export const adminGetAllFaqs = (): Promise<Faq[]> => faqRepo.findAllFaqs();

export const adminCreateFaq = (input: CreateFaqInput): Promise<Faq> =>
  faqRepo.createFaq({
    question: input.question,
    answer: input.answer,
    ...(input.isActive !== undefined && { isActive: input.isActive }),
    ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
  });

export const adminUpdateFaq = async (faqId: string, input: UpdateFaqInput): Promise<Faq> => {
  const faq = await faqRepo.findFaqById(faqId);
  if (!faq) throw Errors.FAQ_NOT_FOUND();
  return faqRepo.updateFaq(faqId, {
    ...(input.question !== undefined && { question: input.question }),
    ...(input.answer !== undefined && { answer: input.answer }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
    ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
  });
};

export const adminToggleFaq = async (faqId: string): Promise<Faq> => {
  const faq = await faqRepo.findFaqById(faqId);
  if (!faq) throw Errors.FAQ_NOT_FOUND();
  return faqRepo.updateFaq(faqId, { isActive: !faq.isActive });
};

export const adminDeleteFaq = async (faqId: string): Promise<void> => {
  const faq = await faqRepo.findFaqById(faqId);
  if (!faq) throw Errors.FAQ_NOT_FOUND();
  await faqRepo.deleteFaq(faqId);
};

// ─── Store Info ───────────────────────────────────────────────────────────────

export const getStoreInfo = async (): Promise<StoreInfo> => {
  const info = await faqRepo.findStoreInfo();
  if (!info) throw Errors.STORE_INFO_NOT_FOUND();
  return info;
};

export const adminUpsertStoreInfo = (input: UpsertStoreInfoInput): Promise<StoreInfo> =>
  faqRepo.upsertStoreInfo({
    storeName: input.storeName,
    email: input.email ?? null,
    phone: input.phone ?? null,
    addressLine1: input.addressLine1 ?? null,
    addressLine2: input.addressLine2 ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    pincode: input.pincode ?? null,
    country: input.country ?? "India",
    website: input.website ?? null,
    openingTime: input.openingTime ?? null,
    closingTime: input.closingTime ?? null,
    description: input.description ?? null,
    instagramUrl: input.instagramUrl ?? null,
    facebookUrl: input.facebookUrl ?? null,
    twitterUrl: input.twitterUrl ?? null,
    youtubeUrl: input.youtubeUrl ?? null,
    shippingCharge: input.shippingCharge ?? 0,
    freeShippingAbove: input.freeShippingAbove ?? null,
  });
