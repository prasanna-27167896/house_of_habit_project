import { prisma } from "@lib/prisma";
import type { Faq, StoreInfo, FaqWriteData, FaqUpdateData, StoreInfoWriteData } from "@interfaces/faq.types";

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const findFaqById = (faqId: string): Promise<Faq | null> =>
  prisma.faq.findUnique({ where: { faqId } });

export const findActiveFaqs = (): Promise<Faq[]> =>
  prisma.faq.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });

export const findAllFaqs = (): Promise<Faq[]> =>
  prisma.faq.findMany({ orderBy: { displayOrder: "asc" } });

export const createFaq = (data: FaqWriteData): Promise<Faq> =>
  prisma.faq.create({ data });

export const updateFaq = (faqId: string, data: FaqUpdateData): Promise<Faq> =>
  prisma.faq.update({ where: { faqId }, data });

export const deleteFaq = (faqId: string): Promise<Faq> =>
  prisma.faq.delete({ where: { faqId } });

// ─── Store Info (singleton) ───────────────────────────────────────────────────

export const findStoreInfo = (): Promise<StoreInfo | null> =>
  prisma.storeInfo.findFirst({ orderBy: { createdAt: "asc" } });

export const upsertStoreInfo = async (data: StoreInfoWriteData): Promise<StoreInfo> => {
  const existing = await findStoreInfo();
  if (existing) {
    return prisma.storeInfo.update({ where: { storeInfoId: existing.storeInfoId }, data });
  }
  return prisma.storeInfo.create({ data });
};
