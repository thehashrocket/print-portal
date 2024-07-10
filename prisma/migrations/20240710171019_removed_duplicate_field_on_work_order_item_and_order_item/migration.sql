/*
  Warnings:

  - You are about to drop the column `plateRan` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `plateRan` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "plateRan";

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "plateRan";
