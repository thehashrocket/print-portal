-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_contactPersonId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_contactPersonId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "contactPersonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "contactPersonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
