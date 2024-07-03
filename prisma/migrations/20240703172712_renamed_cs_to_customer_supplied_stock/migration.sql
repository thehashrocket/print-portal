/*
  Warnings:

  - You are about to drop the column `cs` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `cs` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "cs",
ADD COLUMN     "customerSuppliedStock" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "cs",
ADD COLUMN     "customerSuppliedStock" TEXT;
