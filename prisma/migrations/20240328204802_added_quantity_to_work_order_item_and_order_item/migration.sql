-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
