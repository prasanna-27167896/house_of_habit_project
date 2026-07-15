import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as faqService from "@services/faq.service";
import {
  createFaqSchema,
  updateFaqSchema,
  upsertStoreInfoSchema,
} from "@validators/faq.schema";

// ─── FAQ — Public ─────────────────────────────────────────────────────────────

export const getActiveFaqs = asyncHandler(
  async (_req: Request, res: Response) => {
    const faqs = await faqService.getActiveFaqs();
    sendSuccess(res, faqs);
  },
);

// ─── FAQ — Admin ──────────────────────────────────────────────────────────────

export const adminGetAllFaqs = asyncHandler(
  async (_req: Request, res: Response) => {
    const faqs = await faqService.adminGetAllFaqs();
    sendSuccess(res, faqs);
  },
);

export const adminCreateFaq = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createFaqSchema.parse(req.body);
    const faq = await faqService.adminCreateFaq(input);
    sendSuccess(res, faq, 201);
  },
);

export const adminUpdateFaq = asyncHandler(
  async (req: Request, res: Response) => {
    const faqId = req.params["faqId"] as string;
    const input = updateFaqSchema.parse(req.body);
    const faq = await faqService.adminUpdateFaq(faqId, input);
    sendSuccess(res, faq);
  },
);

export const adminToggleFaq = asyncHandler(
  async (req: Request, res: Response) => {
    const faqId = req.params["faqId"] as string;
    const faq = await faqService.adminToggleFaq(faqId);
    sendSuccess(res, faq);
  },
);

export const adminDeleteFaq = asyncHandler(
  async (req: Request, res: Response) => {
    const faqId = req.params["faqId"] as string;
    await faqService.adminDeleteFaq(faqId);
    sendSuccess(res, { message: "FAQ deleted." });
  },
);

// ─── Store Info — Public ──────────────────────────────────────────────────────

export const getStoreInfo = asyncHandler(
  async (_req: Request, res: Response) => {
    const info = await faqService.getStoreInfo();
    sendSuccess(res, info);
  },
);

// ─── Store Info — Admin ───────────────────────────────────────────────────────

export const adminUpsertStoreInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const input = upsertStoreInfoSchema.parse(req.body);
    const info = await faqService.adminUpsertStoreInfo(input);
    sendSuccess(res, info);
  },
);
