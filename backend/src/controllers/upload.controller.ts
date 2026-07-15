import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import { getPresignedUploadUrl } from "@services/upload.service";
import { presignSchema } from "@validators/upload.schema";

export const presignUpload = asyncHandler(async (req: Request, res: Response) => {
  const input = presignSchema.parse(req.body);
  const result = await getPresignedUploadUrl(input);
  sendSuccess(res, result);
});
