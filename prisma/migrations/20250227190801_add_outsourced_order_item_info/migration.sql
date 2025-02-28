-- CreateTable
CREATE TABLE "OutsourcedOrderItemInfo" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "companyName" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "jobDescription" TEXT,
    "orderNumber" TEXT,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutsourcedOrderItemInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutsourcedOrderItemInfo" ADD CONSTRAINT "OutsourcedOrderItemInfo_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutsourcedOrderItemInfo" ADD CONSTRAINT "OutsourcedOrderItemInfo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
