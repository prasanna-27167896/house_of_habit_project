import * as contactRepo from "@repos/contact.repo";
import { Errors } from "@errors/index";
import { sendContactReplyEmail } from "@utils/email";
import type {
  ContactMessage,
  CustomerFeedback,
  FeedbackOverview,
  ContactListResult,
  FeedbackListResult,
} from "@interfaces/contact.types";
import type {
  SubmitContactInput,
  ReplyContactInput,
  SubmitFeedbackInput,
  PaginationQuery,
} from "@validators/contact.schema";
import type { FeedbackStatus } from "@generated/prisma/client";

// ─── Contact Us ───────────────────────────────────────────────────────────────

export const submitContact = (input: SubmitContactInput): Promise<ContactMessage> =>
  contactRepo.createContactMessage({
    name: input.name,
    email: input.email,
    message: input.message,
  });

export const adminGetAllContacts = async (query: PaginationQuery): Promise<ContactListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [contacts, total] = await Promise.all([
    contactRepo.findAllContacts(skip, query.limit),
    contactRepo.countAllContacts(),
  ]);
  return { contacts, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminGetUnresolvedContacts = (): Promise<ContactMessage[]> =>
  contactRepo.findUnresolvedContacts();

export const adminReplyToContact = async (
  contactId: string,
  input: ReplyContactInput,
): Promise<ContactMessage> => {
  const contact = await contactRepo.findContactById(contactId);
  if (!contact) throw Errors.CONTACT_NOT_FOUND();

  // Send first — if the email fails, we don't store the reply or mark it resolved,
  // so the admin knows it didn't reach the customer and can retry.
  try {
    await sendContactReplyEmail(contact.email, contact.name, "your query", input.replyMessage);
  } catch {
    throw Errors.CONTACT_REPLY_EMAIL_FAILED();
  }

  // Persist the reply text + resolve (durable record of what was actually sent).
  return contactRepo.saveReply(contactId, input.replyMessage);
};

export const adminResolveContact = async (contactId: string): Promise<ContactMessage> => {
  const contact = await contactRepo.findContactById(contactId);
  if (!contact) throw Errors.CONTACT_NOT_FOUND();
  return contactRepo.markContactResolved(contactId);
};

export const adminDeleteContact = async (contactId: string): Promise<void> => {
  const contact = await contactRepo.findContactById(contactId);
  if (!contact) throw Errors.CONTACT_NOT_FOUND();
  await contactRepo.deleteContact(contactId);
};

// ─── Customer Feedback ────────────────────────────────────────────────────────

const deriveFeedbackStatus = (rating: number): FeedbackStatus => {
  if (rating >= 4) return "POSITIVE";
  if (rating === 3) return "NEUTRAL";
  return "NEGATIVE";
};

export const submitFeedback = (input: SubmitFeedbackInput): Promise<CustomerFeedback> =>
  contactRepo.createFeedback({
    name: input.name,
    email: input.email ?? null,
    rating: input.rating,
    feedbackStatus: deriveFeedbackStatus(input.rating),
    category: input.category ?? null,
    message: input.message,
  });

export const adminGetAllFeedback = async (query: PaginationQuery): Promise<FeedbackListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [feedbacks, total] = await Promise.all([
    contactRepo.findAllFeedback(skip, query.limit),
    contactRepo.countAllFeedback(),
  ]);
  return { feedbacks, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminGetFeedbackOverview = (): Promise<FeedbackOverview> =>
  contactRepo.getFeedbackOverview();

export const adminGetNegativeFeedbacks = (): Promise<CustomerFeedback[]> =>
  contactRepo.findLastNegativeFeedbacks(10);

export const adminDeleteFeedback = async (feedbackId: string): Promise<void> => {
  const feedback = await contactRepo.findFeedbackById(feedbackId);
  if (!feedback) throw Errors.FEEDBACK_NOT_FOUND();
  await contactRepo.deleteFeedback(feedbackId);
};
