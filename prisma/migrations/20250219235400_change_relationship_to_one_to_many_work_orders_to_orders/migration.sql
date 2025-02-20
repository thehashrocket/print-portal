-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_workOrderId_fkey";

-- DropIndex
DROP INDEX "Order_workOrderId_key";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "workOrderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
