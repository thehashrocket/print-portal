/*
  Warnings:

  - Made the column `totalCost` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expectedDate` on table `WorkOrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "totalCost" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderItem" ALTER COLUMN "expectedDate" SET NOT NULL;
