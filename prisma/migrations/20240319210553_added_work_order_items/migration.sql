-- CreateTable
CREATE TABLE "WorkOrderItem" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "cutting" TEXT,
    "description" TEXT,
    "drilling" TEXT,
    "finishedQty" INTEGER,
    "folding" TEXT,
    "other" TEXT,
    "pressRun" TEXT,
    "cs" TEXT,
    "size" TEXT,
    "stockOnHand" BOOLEAN NOT NULL DEFAULT false,
    "stockOrdered" TEXT,
    "inkColor" TEXT,
    "amount" DECIMAL(10,2),

    CONSTRAINT "WorkOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
