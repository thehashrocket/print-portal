/*
  Warnings:

  - The `orderNumber` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workOrderNumber` column on the `WorkOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- DropIndex
DROP INDEX "WorkOrder_workOrderNumber_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderNumber",
ADD COLUMN     "orderNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "workOrderNumber",
ADD COLUMN     "workOrderNumber" SERIAL NOT NULL;
