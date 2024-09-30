/*
  Warnings:

  - A unique constraint covering the columns `[quickbooksCustomerId]` on the table `Office` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Office_quickbooksCustomerId_key" ON "Office"("quickbooksCustomerId");
