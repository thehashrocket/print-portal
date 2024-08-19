-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Pending', 'Prepress', 'Press', 'Shipping');

-- CreateEnum
CREATE TYPE "WorkOrderItemStatus" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending', 'Proofing');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "status" "OrderItemStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN "status" "WorkOrderItemStatus" NOT NULL DEFAULT 'Pending';