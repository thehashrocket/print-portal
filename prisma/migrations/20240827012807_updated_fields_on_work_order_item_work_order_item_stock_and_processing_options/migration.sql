/*
  Warnings:

  - The values [InStock,OutOfStock,LowStock] on the enum `StockStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `costPerM` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `inkColor` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockOnHand` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockOrdered` on the `WorkOrderItem` table. All the data in the column will be lost.
  - Made the column `costPerM` on table `WorkOrderItemStock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockStatus_new" AS ENUM ('OnHand', 'CS', 'Ordered');
ALTER TABLE "OrderItemStock" ALTER COLUMN "stockStatus" TYPE "StockStatus_new" USING ("stockStatus"::text::"StockStatus_new");
ALTER TABLE "WorkOrderItemStock" ALTER COLUMN "stockStatus" TYPE "StockStatus_new" USING ("stockStatus"::text::"StockStatus_new");
ALTER TYPE "StockStatus" RENAME TO "StockStatus_old";
ALTER TYPE "StockStatus_new" RENAME TO "StockStatus";
DROP TYPE "StockStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "costPerM",
DROP COLUMN "inkColor",
DROP COLUMN "quantity",
DROP COLUMN "stockOnHand",
DROP COLUMN "stockOrdered",
ADD COLUMN     "ink" TEXT;

-- AlterTable
ALTER TABLE "WorkOrderItemStock" ALTER COLUMN "costPerM" SET NOT NULL,
ALTER COLUMN "costPerM" SET DEFAULT 0;
