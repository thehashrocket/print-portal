-- AlterTable
ALTER TABLE "ShippingInfo" ADD COLUMN     "numberOfPackages" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "WorkOrderItemStock" ADD COLUMN     "supplier" TEXT;
