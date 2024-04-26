/*
  Warnings:

  - You are about to drop the column `orderId` on the `Typesetting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Typesetting" DROP CONSTRAINT "Typesetting_orderId_fkey";

-- AlterTable
ALTER TABLE "Typesetting" DROP COLUMN "orderId";
