/*
  Warnings:

  - A unique constraint covering the columns `[quickbooksInvoiceId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quickbooksInvoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_quickbooksInvoiceId_key" ON "Order"("quickbooksInvoiceId");
