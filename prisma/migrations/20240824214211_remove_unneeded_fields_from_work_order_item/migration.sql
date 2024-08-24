/*
  Warnings:

  - You are about to drop the column `approved` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `finishedQty` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `overUnder` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `pressRun` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "approved",
DROP COLUMN "finishedQty",
DROP COLUMN "overUnder",
DROP COLUMN "pressRun";
