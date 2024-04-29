/*
  Warnings:

  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OrderNote` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WorkOrderNote` table. All the data in the column will be lost.
  - You are about to drop the `Bindery` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `OrderItemStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `OrderNote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `ProcessingOptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ProcessingOptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `ShippingInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ShippingInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Typesetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `TypesettingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TypesettingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `TypesettingProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TypesettingProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `WorkOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `WorkOrderItemStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `WorkOrderNote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bindery" DROP CONSTRAINT "Bindery_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Bindery" DROP CONSTRAINT "Bindery_workOrderItemId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderNote" DROP CONSTRAINT "OrderNote_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrderNote" DROP CONSTRAINT "WorkOrderNote_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItemStock" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderNote" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProcessingOptions" ADD COLUMN     "binderyTime" TEXT,
ADD COLUMN     "binding" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "stitching" TEXT;

-- AlterTable
ALTER TABLE "ShippingInfo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Typesetting" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TypesettingOption" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TypesettingProof" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderItemStock" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderNote" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- DropTable
DROP TABLE "Bindery";

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemStock" ADD CONSTRAINT "OrderItemStock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingInfo" ADD CONSTRAINT "ShippingInfo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypesettingOption" ADD CONSTRAINT "TypesettingOption_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypesettingProof" ADD CONSTRAINT "TypesettingProof_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderNote" ADD CONSTRAINT "WorkOrderNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItemStock" ADD CONSTRAINT "WorkOrderItemStock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
