import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import * as contactService from "@services/contact.service";
import {
  submitContactSchema,
  replyContactSchema,
  submitFeedbackSchema,
  paginationSchema,
} from "@validators/contact.schema";

// ─── Contact Us — Public ──────────────────────────────────────────────────────

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const input = submitContactSchema.parse(req.body);
  // Honeypot tripped → a bot. Pretend success without storing (don't tip it off).
  if (input.website) {
    sendSuccess(res, { message: "Thanks for reaching out. We'll get back to you soon." }, 201);
    return;
  }
  const contact = await contactService.submitContact(input);
  sendSuccess(res, contact, 201);
});

// ─── Contact Us — Admin ───────────────────────────────────────────────────────

export const adminGetAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const query = paginationSchema.parse(req.query);
  const result = await contactService.adminGetAllContacts(query);
  sendSuccess(res, result);
});

export const adminGetUnresolvedContacts = asyncHandler(async (_req: Request, res: Response) => {
  const contacts = await contactService.adminGetUnresolvedContacts();
  sendSuccess(res, contacts);
});

export const adminReplyToContact = asyncHandler(async (req: Request, res: Response) => {
  const contactId = req.params["contactId"] as string;
  const input = replyContactSchema.parse(req.body);
  const contact = await contactService.adminReplyToContact(contactId, input);
  sendSuccess(res, contact);
});

export const adminResolveContact = asyncHandler(async (req: Request, res: Response) => {
  const contactId = req.params["contactId"] as string;
  const contact = await contactService.adminResolveContact(contactId);
  sendSuccess(res, contact);
});

export const adminDeleteContact = asyncHandler(async (req: Request, res: Response) => {
  const contactId = req.params["contactId"] as string;
  await contactService.adminDeleteContact(contactId);
  sendSuccess(res, { message: "Contact message deleted." });
});

// ─── Customer Feedback — Public ───────────────────────────────────────────────

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const input = submitFeedbackSchema.parse(req.body);
  if (input.website) {
    sendSuccess(res, { message: "Thanks for your feedback." }, 201);
    return;
  }
  const feedback = await contactService.submitFeedback(input);
  sendSuccess(res, feedback, 201);
});

// ─── Customer Feedback — Admin ────────────────────────────────────────────────

export const adminGetAllFeedback = asyncHandler(async (req: Request, res: Response) => {
  const query = paginationSchema.parse(req.query);
  const result = await contactService.adminGetAllFeedback(query);
  sendSuccess(res, result);
});

export const adminGetFeedbackOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await contactService.adminGetFeedbackOverview();
  sendSuccess(res, overview);
});

export const adminGetNegativeFeedbacks = asyncHandler(async (_req: Request, res: Response) => {
  const feedbacks = await contactService.adminGetNegativeFeedbacks();
  sendSuccess(res, feedbacks);
});

export const adminDeleteFeedback = asyncHandler(async (req: Request, res: Response) => {
  const feedbackId = req.params["feedbackId"] as string;
  await contactService.adminDeleteFeedback(feedbackId);
  sendSuccess(res, { message: "Feedback deleted." });
});
