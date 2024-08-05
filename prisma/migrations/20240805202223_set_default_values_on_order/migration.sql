/*
  Warnings:

  - Made the column `deposit` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalCost` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deposit" SET NOT NULL,
ALTER COLUMN "deposit" SET DEFAULT 0,
ALTER COLUMN "totalCost" SET NOT NULL,
ALTER COLUMN "totalCost" SET DEFAULT 0;
