import { generatePublicPresignedPutUrl } from "@services/cloudflare.service";
import type { PresignInput } from "@validators/upload.schema";

export const getPresignedUploadUrl = (input: PresignInput) =>
  generatePublicPresignedPutUrl(input.folder, input.contentType, input.fileSize);
