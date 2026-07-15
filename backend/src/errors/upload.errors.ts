import { AppError } from "@utils/AppError";

export const UploadErrors = {
  INVALID_FILE_TYPE: () =>
    new AppError("Only JPG, PNG, and WebP images are allowed.", 400, "INVALID_FILE_TYPE"),
  FILE_TOO_LARGE: () =>
    new AppError("File size must not exceed 5 MB.", 400, "FILE_TOO_LARGE"),
};
