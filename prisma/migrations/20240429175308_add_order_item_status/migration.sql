/*
  Warnings:

  - The values [Bindery,Prepress,Press] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Proofing] on the enum `WorkOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- Create new enum types
CREATE TYPE "OrderItemStatus" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Pending', 'Prepress', 'Press', 'Shipping');
CREATE TYPE "WorkOrderItemStatus" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending', 'Proofing');

-- Alter enums for the Order and WorkOrder tables
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoicing', 'PaymentReceived', 'Pending', 'Shipping');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";

CREATE TYPE "WorkOrderStatus_new" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending');
ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE "WorkOrderStatus_new" USING ("status"::text::"WorkOrderStatus_new");
ALTER TYPE "WorkOrderStatus" RENAME TO "WorkOrderStatus_old";
DROP TYPE "WorkOrderStatus_old";
ALTER TYPE "WorkOrderStatus_new" RENAME TO "WorkOrderStatus";
COMMIT;

-- Add new columns with default values
ALTER TABLE "OrderItem" ADD COLUMN "status" "OrderItemStatus" NOT NULL DEFAULT 'Pending';
ALTER TABLE "WorkOrderItem" ADD COLUMN "status" "WorkOrderItemStatus" NOT NULL DEFAULT 'Pending';
