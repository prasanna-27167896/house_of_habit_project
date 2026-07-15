import crypto from "crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@config/env";

const R2_ENDPOINT = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Public bucket — category, brand, product images (permanently accessible via public URL)
const publicS3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_PUBLIC_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_PUBLIC_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const PUBLIC_BUCKET = env.CLOUDFLARE_PUBLIC_BUCKET_NAME;

export const getPublicUrl = (key: string): string =>
  `${env.CLOUDFLARE_PUBLIC_URL}/${key}`;

// Generate a presigned PUT URL for direct frontend → R2 upload.
// Returns the R2 key, permanent public URL, and the signed upload URL (15 min expiry).
export const generatePublicPresignedPutUrl = async (
  folder: string,
  contentType: string,
  fileSize: number,
): Promise<{ signedUrl: string; key: string; publicUrl: string }> => {
  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: PUBLIC_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  const signedUrl = await getSignedUrl(publicS3, command, { expiresIn: 900 });
  return { signedUrl, key, publicUrl: getPublicUrl(key) };
};

// Delete a public R2 object — NoSuchKey is treated as success (idempotent).
export const deleteFromPublicR2 = async (key: string): Promise<void> => {
  try {
    await publicS3.send(new DeleteObjectCommand({ Bucket: PUBLIC_BUCKET, Key: key }));
  } catch (err) {
    if (err instanceof S3ServiceException && err.name === "NoSuchKey") return;
    throw err;
  }
};
