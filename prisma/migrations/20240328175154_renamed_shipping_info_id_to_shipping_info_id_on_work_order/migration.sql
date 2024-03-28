/*
  Warnings:

  - You are about to drop the column `ShippingInfoId` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_ShippingInfoId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "ShippingInfoId",
ADD COLUMN     "shippingInfoId" TEXT;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
