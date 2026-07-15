import { AppError } from "@utils/AppError";

export const ContactErrors = {
  CONTACT_NOT_FOUND: () => new AppError("Contact message not found.", 404, "CONTACT_NOT_FOUND"),
  FEEDBACK_NOT_FOUND: () => new AppError("Feedback not found.", 404, "FEEDBACK_NOT_FOUND"),
  CONTACT_REPLY_EMAIL_FAILED: () =>
    new AppError("Could not send the reply email. The reply was not saved — please try again.", 502, "CONTACT_REPLY_EMAIL_FAILED"),
};
