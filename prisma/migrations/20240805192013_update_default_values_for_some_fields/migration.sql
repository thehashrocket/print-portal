/*
  Warnings:

  - Made the column `expectedDate` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expectedDate` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `ProcessingOptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Role` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expectedDate` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `WorkOrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionName" ADD VALUE 'InvoiceCreate';
ALTER TYPE "PermissionName" ADD VALUE 'InvoiceDelete';
ALTER TYPE "PermissionName" ADD VALUE 'InvoiceRead';

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "expectedDate" SET NOT NULL,
ALTER COLUMN "expectedDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "expectedDate" SET NOT NULL,
ALTER COLUMN "expectedDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "ProcessingOptions" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "expectedDate" SET NOT NULL,
ALTER COLUMN "expectedDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "WorkOrderItem" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';
