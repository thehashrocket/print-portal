-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "workOrderNumber" DROP DEFAULT,
ALTER COLUMN "workOrderNumber" SET DATA TYPE TEXT;
DROP SEQUENCE "WorkOrder_workOrderNumber_seq";
