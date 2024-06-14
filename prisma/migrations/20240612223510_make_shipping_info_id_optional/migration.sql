-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_shippingInfoId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "shippingInfoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
