-- CreateTable
CREATE TABLE "OrderNote" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStock" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
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

    CONSTRAINT "OrderStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStock" ADD CONSTRAINT "OrderStock_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
