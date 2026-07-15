import { prisma } from "@lib/prisma";
import type {
  ContactMessage,
  CustomerFeedback,
  FeedbackStatus,
  ContactMessageWriteData,
  CustomerFeedbackWriteData,
  FeedbackOverview,
} from "@interfaces/contact.types";

// ─── Contact Message ──────────────────────────────────────────────────────────

export const createContactMessage = (data: ContactMessageWriteData): Promise<ContactMessage> =>
  prisma.contactMessage.create({ data });

export const findContactById = (contactId: string): Promise<ContactMessage | null> =>
  prisma.contactMessage.findUnique({ where: { contactId } });

export const findAllContacts = (skip: number, take: number): Promise<ContactMessage[]> =>
  prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, skip, take });

export const countAllContacts = (): Promise<number> => prisma.contactMessage.count();

export const findUnresolvedContacts = (): Promise<ContactMessage[]> =>
  prisma.contactMessage.findMany({
    where: { isResolved: false },
    orderBy: { createdAt: "desc" },
  });

export const markContactResolved = (contactId: string): Promise<ContactMessage> =>
  prisma.contactMessage.update({ where: { contactId }, data: { isResolved: true } });

// Store the admin's reply and mark the message resolved.
export const saveReply = (contactId: string, replyMessage: string): Promise<ContactMessage> =>
  prisma.contactMessage.update({
    where: { contactId },
    data: { replyMessage, repliedAt: new Date(), isResolved: true },
  });

export const deleteContact = (contactId: string): Promise<ContactMessage> =>
  prisma.contactMessage.delete({ where: { contactId } });

// ─── Customer Feedback ────────────────────────────────────────────────────────

export const createFeedback = (data: CustomerFeedbackWriteData): Promise<CustomerFeedback> =>
  prisma.customerFeedback.create({ data });

export const findFeedbackById = (feedbackId: string): Promise<CustomerFeedback | null> =>
  prisma.customerFeedback.findUnique({ where: { feedbackId } });

export const findAllFeedback = (skip: number, take: number): Promise<CustomerFeedback[]> =>
  prisma.customerFeedback.findMany({ orderBy: { createdAt: "desc" }, skip, take });

export const countAllFeedback = (): Promise<number> => prisma.customerFeedback.count();

export const deleteFeedback = (feedbackId: string): Promise<CustomerFeedback> =>
  prisma.customerFeedback.delete({ where: { feedbackId } });

export const findLastNegativeFeedbacks = (n: number): Promise<CustomerFeedback[]> =>
  prisma.customerFeedback.findMany({
    where: { feedbackStatus: "NEGATIVE" },
    orderBy: { createdAt: "desc" },
    take: n,
  });

export const getFeedbackOverview = async (): Promise<FeedbackOverview> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [total, positive, neutral, negative, todayTotal] = await Promise.all([
    prisma.customerFeedback.count(),
    prisma.customerFeedback.count({ where: { feedbackStatus: "POSITIVE" } }),
    prisma.customerFeedback.count({ where: { feedbackStatus: "NEUTRAL" } }),
    prisma.customerFeedback.count({ where: { feedbackStatus: "NEGATIVE" } }),
    prisma.customerFeedback.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  return { total, positive, neutral, negative, todayTotal };
};
