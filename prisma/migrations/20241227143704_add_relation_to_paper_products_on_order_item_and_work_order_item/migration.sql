-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "paperProductId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
