-- DropForeignKey
ALTER TABLE "ProcessingOptions" DROP CONSTRAINT "ProcessingOptions_workOrderId_fkey";

-- AlterTable
ALTER TABLE "ProcessingOptions" ALTER COLUMN "workOrderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
