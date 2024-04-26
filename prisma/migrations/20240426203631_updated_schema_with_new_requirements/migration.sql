/*
  Warnings:

  - You are about to drop the column `binderyTime` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cutting` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `drilling` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `folding` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `ProcessingOptions` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `ProcessingOptions` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `Typesetting` table. All the data in the column will be lost.
  - You are about to drop the column `binderyTime` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `cutting` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `drilling` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `folding` on the `WorkOrderItem` table. All the data in the column will be lost.
  - You are about to drop the `OrderStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkOrderStock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `Typesetting` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoicePrintEmailOptions" AS ENUM ('Print', 'Email', 'Both');

-- DropForeignKey
ALTER TABLE "OrderStock" DROP CONSTRAINT "OrderStock_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessingOptions" DROP CONSTRAINT "ProcessingOptions_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessingOptions" DROP CONSTRAINT "ProcessingOptions_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Typesetting" DROP CONSTRAINT "Typesetting_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrderItem" DROP CONSTRAINT "WorkOrderItem_workOrderId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrderStock" DROP CONSTRAINT "WorkOrderStock_workOrderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "binderyTime",
ADD COLUMN     "dateInvoiced" TIMESTAMP(3),
ADD COLUMN     "inHandsDate" TIMESTAMP(3),
ADD COLUMN     "invoiceNumber" INTEGER,
ADD COLUMN     "invoicePrintEmail" "InvoicePrintEmailOptions" NOT NULL DEFAULT 'Both';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "cutting",
DROP COLUMN "description",
DROP COLUMN "drilling",
DROP COLUMN "folding",
DROP COLUMN "other",
ADD COLUMN     "specialInstructions" TEXT;

-- AlterTable
ALTER TABLE "ProcessingOptions" DROP COLUMN "orderId",
DROP COLUMN "workOrderId",
ADD COLUMN     "orderItemId" TEXT,
ADD COLUMN     "workOrderItemId" TEXT,
ALTER COLUMN "cutting" DROP NOT NULL,
ALTER COLUMN "cutting" DROP DEFAULT,
ALTER COLUMN "cutting" SET DATA TYPE TEXT,
ALTER COLUMN "padding" DROP NOT NULL,
ALTER COLUMN "padding" DROP DEFAULT,
ALTER COLUMN "padding" SET DATA TYPE TEXT,
ALTER COLUMN "drilling" DROP NOT NULL,
ALTER COLUMN "drilling" DROP DEFAULT,
ALTER COLUMN "drilling" SET DATA TYPE TEXT,
ALTER COLUMN "folding" DROP NOT NULL,
ALTER COLUMN "folding" DROP DEFAULT,
ALTER COLUMN "folding" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Typesetting" DROP COLUMN "workOrderId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "orderItemId" TEXT,
ADD COLUMN     "workOrderItemId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "binderyTime",
ADD COLUMN     "invoicePrintEmail" "InvoicePrintEmailOptions" NOT NULL DEFAULT 'Both';

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "cutting",
DROP COLUMN "description",
DROP COLUMN "drilling",
DROP COLUMN "folding",
ADD COLUMN     "specialInstructions" TEXT,
ALTER COLUMN "workOrderId" DROP NOT NULL;

-- DropTable
DROP TABLE "OrderStock";

-- DropTable
DROP TABLE "WorkOrderStock";

-- CreateTable
CREATE TABLE "Bindery" (
    "binderyTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "cutting" TEXT,
    "description" TEXT,
    "drilling" TEXT,
    "folding" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "other" TEXT,
    "workOrderItemId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bindery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemStock" (
    "id" TEXT NOT NULL,
    "stockQty" INTEGER NOT NULL,
    "costPerM" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "from" TEXT,
    "expectedDate" TIMESTAMP(3),
    "orderedDate" TIMESTAMP(3),
    "received" BOOLEAN NOT NULL DEFAULT false,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "stockStatus" "StockStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderItemId" TEXT NOT NULL,

    CONSTRAINT "OrderItemStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderItemStock" (
    "id" TEXT NOT NULL,
    "stockQty" INTEGER NOT NULL,
    "costPerM" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "from" TEXT,
    "expectedDate" TIMESTAMP(3),
    "orderedDate" TIMESTAMP(3),
    "received" BOOLEAN NOT NULL DEFAULT false,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "stockStatus" "StockStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workOrderItemId" TEXT NOT NULL,

    CONSTRAINT "WorkOrderItemStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bindery" ADD CONSTRAINT "Bindery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bindery" ADD CONSTRAINT "Bindery_workOrderItemId_fkey" FOREIGN KEY ("workOrderItemId") REFERENCES "WorkOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemStock" ADD CONSTRAINT "OrderItemStock_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_workOrderItemId_fkey" FOREIGN KEY ("workOrderItemId") REFERENCES "WorkOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typesetting" ADD CONSTRAINT "Typesetting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typesetting" ADD CONSTRAINT "Typesetting_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typesetting" ADD CONSTRAINT "Typesetting_workOrderItemId_fkey" FOREIGN KEY ("workOrderItemId") REFERENCES "WorkOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItemStock" ADD CONSTRAINT "WorkOrderItemStock_workOrderItemId_fkey" FOREIGN KEY ("workOrderItemId") REFERENCES "WorkOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
