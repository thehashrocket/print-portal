-- CreateTable
CREATE TABLE "OutsourcedOrderItemInfoFile" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outsourcedOrderItemInfoId" TEXT NOT NULL,

    CONSTRAINT "OutsourcedOrderItemInfoFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutsourcedOrderItemInfoFile" ADD CONSTRAINT "OutsourcedOrderItemInfoFile_outsourcedOrderItemInfoId_fkey" FOREIGN KEY ("outsourcedOrderItemInfoId") REFERENCES "OutsourcedOrderItemInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
