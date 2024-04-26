/*
  Warnings:

  - You are about to drop the column `pressRun` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pressRun` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "pressRun";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "pressRun";
