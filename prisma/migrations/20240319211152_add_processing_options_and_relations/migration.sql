-- CreateTable
CREATE TABLE "ProcessingOptions" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "orderId" TEXT,
    "cutting" BOOLEAN NOT NULL DEFAULT false,
    "padding" BOOLEAN NOT NULL DEFAULT false,
    "drilling" BOOLEAN NOT NULL DEFAULT false,
    "folding" BOOLEAN NOT NULL DEFAULT false,
    "other" TEXT,
    "numberingStart" INTEGER,
    "numberingEnd" INTEGER,
    "numberingColor" TEXT,

    CONSTRAINT "ProcessingOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingOptions_workOrderId_key" ON "ProcessingOptions"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingOptions_orderId_key" ON "ProcessingOptions"("orderId");

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
