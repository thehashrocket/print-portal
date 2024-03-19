-- CreateTable
CREATE TABLE "WorkOrderStock" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "stockQty" INTEGER NOT NULL,
    "costPerM" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "from" TEXT,
    "expectedDate" TIMESTAMP(3),
    "orderedDate" TIMESTAMP(3),
    "received" BOOLEAN NOT NULL DEFAULT false,
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "stockStatus" "StockStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderVersion" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrderStock" ADD CONSTRAINT "WorkOrderStock_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderVersion" ADD CONSTRAINT "WorkOrderVersion_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
