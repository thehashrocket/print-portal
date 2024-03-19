-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "dateIn" TIMESTAMP(3) NOT NULL,
    "inHandsDate" TIMESTAMP(3) NOT NULL,
    "estimateNumber" TEXT NOT NULL,
    "purchaseOrderNumber" TEXT NOT NULL,
    "pressRun" TEXT NOT NULL,
    "specialInstructions" TEXT,
    "artwork" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER,
    "plateRan" TEXT,
    "expectedDate" TIMESTAMP(3),
    "deposit" DECIMAL(10,2),
    "costPerM" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "binderyTime" TEXT,
    "overUnder" TEXT,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShippingInfo" ADD CONSTRAINT "ShippingInfo_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
