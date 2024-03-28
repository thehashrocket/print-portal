/*
  Warnings:

  - You are about to drop the column `orderId` on the `ShippingInfo` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `ShippingInfo` table. All the data in the column will be lost.
  - Added the required column `shippingInfoId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShippingInfo" DROP CONSTRAINT "ShippingInfo_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ShippingInfo" DROP CONSTRAINT "ShippingInfo_workOrderId_fkey";

-- DropIndex
DROP INDEX "ShippingInfo_orderId_key";

-- DropIndex
DROP INDEX "ShippingInfo_workOrderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingInfoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShippingInfo" DROP COLUMN "orderId",
DROP COLUMN "workOrderId";

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "ShippingInfoId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_ShippingInfoId_fkey" FOREIGN KEY ("ShippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
