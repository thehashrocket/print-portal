-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isWalkIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walkInCustomerId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_walkInCustomerId_fkey" FOREIGN KEY ("walkInCustomerId") REFERENCES "WalkInCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
