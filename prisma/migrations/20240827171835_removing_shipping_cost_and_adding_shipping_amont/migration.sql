/*
  Warnings:

  - You are about to drop the column `shippingCost` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCost` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "shippingCost",
ADD COLUMN     "shippingAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "shippingCost",
ADD COLUMN     "shippingAmount" DECIMAL(10,2);
