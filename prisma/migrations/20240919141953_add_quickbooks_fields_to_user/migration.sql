-- DropIndex
DROP INDEX "OrderItem_orderItemNumber_idx";

-- DropIndex
DROP INDEX "WorkOrderItem_workOrderItemNumber_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "quickbooksAccessToken" TEXT,
ADD COLUMN     "quickbooksRealmId" TEXT,
ADD COLUMN     "quickbooksRefreshToken" TEXT,
ADD COLUMN     "quickbooksTokenExpiry" TIMESTAMP(3);
