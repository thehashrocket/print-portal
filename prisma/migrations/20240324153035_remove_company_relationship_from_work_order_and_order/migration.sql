/*
  Warnings:

  - You are about to drop the column `companyId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_companyId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_companyId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "companyId";
