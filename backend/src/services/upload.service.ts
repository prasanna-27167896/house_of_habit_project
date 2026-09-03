import { generatePublicPresignedPutUrl } from "@services/cloudflare.service";
import type { PresignInput, PresignReviewInput } from "@validators/upload.schema";

export const getPresignedUploadUrl = (input: PresignInput) =>
  generatePublicPresignedPutUrl(input.folder, input.contentType, input.fileSize);

export const getPresignedReviewUploadUrl = (input: PresignReviewInput) =>
  generatePublicPresignedPutUrl("reviews", input.contentType, input.fileSize);
