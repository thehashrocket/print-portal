/*
  Warnings:

  - You are about to drop the column `syncToken` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "syncToken";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "syncToken" TEXT;
