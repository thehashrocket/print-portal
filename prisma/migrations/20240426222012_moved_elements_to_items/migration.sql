/*
  Warnings:

  - You are about to drop the column `approved` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `artwork` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `artwork` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "approved",
DROP COLUMN "artwork";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "artwork" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "approved",
DROP COLUMN "artwork";

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "artwork" TEXT;
