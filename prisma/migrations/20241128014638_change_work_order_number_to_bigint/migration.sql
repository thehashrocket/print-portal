-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "workOrderNumber" SET DATA TYPE bigint;
ALTER SEQUENCE "WorkOrder_workOrderNumber_seq" OWNED BY "WorkOrder"."workOrderNumber";
ALTER TABLE "WorkOrder" ALTER COLUMN "workOrderNumber" SET DEFAULT nextval('"WorkOrder_workOrderNumber_seq"');