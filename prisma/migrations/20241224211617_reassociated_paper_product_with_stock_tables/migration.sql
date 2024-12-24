/*
  Warnings:

  - You are about to drop the column `paperProductId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_paperProductId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrderItem" DROP CONSTRAINT "WorkOrderItem_paperProductId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "paperProductId";

-- AlterTable
ALTER TABLE "OrderItemStock" ADD COLUMN     "paperProductId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrderItemStock" ADD COLUMN     "paperProductId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItemStock" ADD CONSTRAINT "OrderItemStock_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItemStock" ADD CONSTRAINT "WorkOrderItemStock_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
