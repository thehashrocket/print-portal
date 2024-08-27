-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "shippingCost" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "shippingCost" DECIMAL(10,2);
