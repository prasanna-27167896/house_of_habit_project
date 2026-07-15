-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "forgot_passwords" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
