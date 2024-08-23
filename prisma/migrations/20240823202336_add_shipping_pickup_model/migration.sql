-- CreateTable
CREATE TABLE "ShippingPickup" (
    "id" TEXT NOT NULL,
    "shippingInfoId" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "notes" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ShippingPickup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShippingPickup" ADD CONSTRAINT "ShippingPickup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingPickup" ADD CONSTRAINT "ShippingPickup_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
