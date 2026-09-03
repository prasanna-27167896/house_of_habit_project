import { z } from "zod";

export const submitContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(3000),
  // Honeypot: a hidden field real users leave empty. If a bot fills it, we drop
  // the submission (see controller). Accepted, not validated, so the bot can't tell.
  website: z.string().optional(),
});

export const replyContactSchema = z.object({
  replyMessage: z.string().min(1).max(3000),
});

export const submitFeedbackSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  category: z.string().max(100).optional(),
  message: z.string().min(1).max(3000),
  website: z.string().optional(), // honeypot (see submitContactSchema)
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SubmitContactInput = z.infer<typeof submitContactSchema>;
export type ReplyContactInput = z.infer<typeof replyContactSchema>;
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
