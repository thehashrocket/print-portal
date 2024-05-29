/*
  Warnings:

  - You are about to drop the column `costPerM` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `overUnder` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `plateRan` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `proofCount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `proofType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `Typesetting` table. All the data in the column will be lost.
  - You are about to drop the column `costPerM` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `overUnder` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `plateRan` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "costPerM",
DROP COLUMN "overUnder",
DROP COLUMN "plateRan",
DROP COLUMN "prepTime",
DROP COLUMN "proofCount",
DROP COLUMN "proofType";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "costPerM" DECIMAL(10,2),
ADD COLUMN     "overUnder" TEXT,
ADD COLUMN     "plateRan" TEXT,
ADD COLUMN     "prepTime" INTEGER,
ADD COLUMN     "proofCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proofType" TEXT;

-- AlterTable
ALTER TABLE "Typesetting" DROP COLUMN "cost";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "costPerM",
DROP COLUMN "overUnder",
DROP COLUMN "plateRan",
DROP COLUMN "prepTime";

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "costPerM" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "overUnder" TEXT,
ADD COLUMN     "plateRan" TEXT,
ADD COLUMN     "prepTime" INTEGER;
