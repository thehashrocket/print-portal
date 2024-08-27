/*
  Warnings:

  - You are about to drop the column `approved` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `costPerM` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `inkColor` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `overUnder` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockOnHand` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockOrdered` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `workOrderItemId` to the `OrderItemStock` table without a default value. This is not possible if the table is not empty.
  - Made the column `costPerM` on table `OrderItemStock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pressRun" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "approved",
DROP COLUMN "costPerM",
DROP COLUMN "inkColor",
DROP COLUMN "overUnder",
DROP COLUMN "quantity",
DROP COLUMN "stockOnHand",
DROP COLUMN "stockOrdered",
ADD COLUMN     "ink" TEXT,
ADD COLUMN     "other" TEXT;

-- AlterTable
ALTER TABLE "OrderItemStock" ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "workOrderItemId" TEXT NOT NULL,
ALTER COLUMN "costPerM" SET NOT NULL,
ALTER COLUMN "costPerM" SET DEFAULT 0;
