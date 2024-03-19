-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "pressRun" TEXT NOT NULL,
    "specialInstructions" TEXT,
    "artwork" TEXT,
    "proofType" TEXT,
    "proofCount" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER,
    "plateRan" TEXT,
    "expectedDate" TIMESTAMP(3),
    "deposit" DECIMAL(10,2),
    "costPerM" DECIMAL(10,2),
    "totalCost" DECIMAL(10,2),
    "binderyTime" TEXT,
    "overUnder" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,
    "shippingInfoId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "finishedQty" INTEGER NOT NULL,
    "pressRun" TEXT NOT NULL,
    "cs" TEXT NOT NULL,
    "size" TEXT,
    "stockOnHand" BOOLEAN NOT NULL DEFAULT false,
    "stockOrdered" TEXT,
    "inkColor" TEXT,
    "amount" DECIMAL(10,2),

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_workOrderId_key" ON "Order"("workOrderId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingOptions" ADD CONSTRAINT "ProcessingOptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingInfo" ADD CONSTRAINT "ShippingInfo_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Typesetting" ADD CONSTRAINT "Typesetting_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
