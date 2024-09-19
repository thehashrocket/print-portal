/*
  Warnings:

  - A unique constraint covering the columns `[quickbooksId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quickbooksCustomerId]` on the table `Office` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "quickbooksCustomerId" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Company_quickbooksId_key" ON "Company"("quickbooksId");

-- CreateIndex
CREATE UNIQUE INDEX "Office_quickbooksCustomerId_key" ON "Office"("quickbooksCustomerId");
