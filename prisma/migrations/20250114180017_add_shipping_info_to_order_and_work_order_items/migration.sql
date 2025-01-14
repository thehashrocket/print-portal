-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "shippingInfoId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "shippingInfoId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
