-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "totalCost" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkOrderItem" ALTER COLUMN "expectedDate" SET DEFAULT CURRENT_TIMESTAMP;
