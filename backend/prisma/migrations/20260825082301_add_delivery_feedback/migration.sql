-- CreateTable
CREATE TABLE "delivery_feedbacks" (
    "feedbackId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_feedbacks_pkey" PRIMARY KEY ("feedbackId")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_feedbacks_orderId_key" ON "delivery_feedbacks"("orderId");

-- AddForeignKey
ALTER TABLE "delivery_feedbacks" ADD CONSTRAINT "delivery_feedbacks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
