/*
  Warnings:

  - A unique constraint covering the columns `[name,quickbooksId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_name_quickbooksId_key" ON "Company"("name", "quickbooksId");
