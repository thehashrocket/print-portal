-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingInfoId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingInfoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
