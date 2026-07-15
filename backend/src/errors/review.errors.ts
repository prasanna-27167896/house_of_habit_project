import { AppError } from "@utils/AppError";

export const ReviewErrors = {
  REVIEW_NOT_FOUND: () => new AppError("Review not found.", 404, "REVIEW_NOT_FOUND"),
  ALREADY_REVIEWED: () => new AppError("You have already reviewed this product.", 409, "ALREADY_REVIEWED"),
  REVIEW_NOT_PURCHASED: () => new AppError("You can only review a product you've purchased.", 403, "REVIEW_NOT_PURCHASED"),
  REVIEW_NOT_OWNED: () => new AppError("You can only modify your own review.", 403, "REVIEW_NOT_OWNED"),
  REPLY_ALREADY_EXISTS: () => new AppError("A reply already exists for this review.", 409, "REPLY_ALREADY_EXISTS"),
  REPLY_NOT_FOUND: () => new AppError("Reply not found.", 404, "REPLY_NOT_FOUND"),
  INVALID_RATING: () => new AppError("Rating must be between 1 and 5.", 400, "INVALID_RATING"),
};
