/*
  Warnings:

  - You are about to drop the column `description` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `expectedDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `specialInstructions` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deposit` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `expectedDate` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `specialInstructions` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "description",
DROP COLUMN "expectedDate",
DROP COLUMN "specialInstructions",
DROP COLUMN "totalCost";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "deposit",
DROP COLUMN "description",
DROP COLUMN "expectedDate",
DROP COLUMN "specialInstructions",
DROP COLUMN "totalCost";
