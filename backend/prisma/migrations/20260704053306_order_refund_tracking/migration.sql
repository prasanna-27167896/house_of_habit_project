-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REFUND_PENDING', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "refundedAt" TIMESTAMP(3);
