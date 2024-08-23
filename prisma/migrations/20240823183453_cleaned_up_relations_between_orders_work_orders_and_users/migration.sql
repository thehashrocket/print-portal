/*
  Warnings:

  - Added the required column `contactPersonId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactPersonId` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_contactPersonId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "contactPersonId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "contactPersonId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
