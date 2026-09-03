-- CreateTable
CREATE TABLE "order_tracking_logs" (
    "logId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_tracking_logs_pkey" PRIMARY KEY ("logId")
);

-- AddForeignKey
ALTER TABLE "order_tracking_logs" ADD CONSTRAINT "order_tracking_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
