/*
  Warnings:

  - The values [Bindery,Prepress,Press] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Proofing] on the enum `WorkOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Pending', 'Prepress', 'Press', 'Shipping');

-- CreateEnum
CREATE TYPE "WorkOrderItemStatus" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending', 'Proofing');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoicing', 'PaymentReceived', 'Pending', 'Shipping');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkOrderStatus_new" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending');
ALTER TABLE "WorkOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE "WorkOrderStatus_new" USING ("status"::text::"WorkOrderStatus_new");
ALTER TYPE "WorkOrderStatus" RENAME TO "WorkOrderStatus_old";
ALTER TYPE "WorkOrderStatus_new" RENAME TO "WorkOrderStatus";
DROP TYPE "WorkOrderStatus_old";
ALTER TABLE "WorkOrder" ALTER COLUMN "status" SET DEFAULT 'Draft';
COMMIT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "status" "WorkOrderItemStatus" NOT NULL DEFAULT 'Pending';
