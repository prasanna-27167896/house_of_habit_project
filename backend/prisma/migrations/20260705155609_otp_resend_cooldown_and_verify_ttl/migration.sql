-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "lastOtpSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "forgot_passwords" ADD COLUMN     "lastOtpSentAt" TIMESTAMP(3);
