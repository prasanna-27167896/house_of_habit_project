import type { ContactMessage, CustomerFeedback, FeedbackStatus } from "@generated/prisma/client";

export type { ContactMessage, CustomerFeedback, FeedbackStatus };

// ─── Write data ───────────────────────────────────────────────────────────────

export type ContactMessageWriteData = {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
};

export type CustomerFeedbackWriteData = {
  name: string;
  email: string | null;
  rating: number;
  feedbackStatus: FeedbackStatus;
  category: string | null;
  message: string;
};

// ─── List / overview results ──────────────────────────────────────────────────

export type ContactListResult = {
  contacts: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FeedbackListResult = {
  feedbacks: CustomerFeedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FeedbackOverview = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  todayTotal: number;
};
