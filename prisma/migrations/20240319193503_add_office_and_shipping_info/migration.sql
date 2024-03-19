-- AlterTable
ALTER TABLE "User" ADD COLUMN     "officeId" TEXT;

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingInfo" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "orderId" TEXT,
    "instructions" TEXT,
    "shippingOther" TEXT,
    "shippingDate" TIMESTAMP(3),
    "shippingMethod" "ShippingMethod" NOT NULL,
    "shippingCost" DECIMAL(10,2),
    "officeId" TEXT NOT NULL,
    "shipToSameAsBillTo" BOOLEAN NOT NULL DEFAULT false,
    "attentionTo" TEXT,

    CONSTRAINT "ShippingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingInfo_workOrderId_key" ON "ShippingInfo"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingInfo_orderId_key" ON "ShippingInfo"("orderId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingInfo" ADD CONSTRAINT "ShippingInfo_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
