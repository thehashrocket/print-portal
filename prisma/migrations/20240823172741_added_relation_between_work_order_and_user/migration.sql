-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "contactPersonId" TEXT;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
