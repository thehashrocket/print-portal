/*
  Warnings:

  - Made the column `brand` on table `PaperProduct` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paperType` on table `PaperProduct` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finish` on table `PaperProduct` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PaperProduct" ALTER COLUMN "brand" SET NOT NULL,
ALTER COLUMN "paperType" SET NOT NULL,
ALTER COLUMN "finish" SET NOT NULL;
