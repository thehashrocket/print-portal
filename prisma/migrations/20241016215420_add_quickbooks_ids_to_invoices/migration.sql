/*
  Warnings:

  - A unique constraint covering the columns `[quickbooksId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncToken" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_quickbooksId_key" ON "Invoice"("quickbooksId");
