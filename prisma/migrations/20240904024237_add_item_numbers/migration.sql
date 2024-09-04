-- CreateSequence
CREATE SEQUENCE "WorkOrderItem_workOrderItemNumber_seq";
CREATE SEQUENCE "OrderItem_orderItemNumber_seq";

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN "workOrderItemNumber" INT NOT NULL DEFAULT nextval('"WorkOrderItem_workOrderItemNumber_seq"');
ALTER TABLE "OrderItem" ADD COLUMN "orderItemNumber" INT NOT NULL DEFAULT nextval('"OrderItem_orderItemNumber_seq"');

-- CreateIndex
CREATE INDEX "WorkOrderItem_workOrderItemNumber_idx" ON "WorkOrderItem"("workOrderItemNumber");
CREATE INDEX "OrderItem_orderItemNumber_idx" ON "OrderItem"("orderItemNumber");