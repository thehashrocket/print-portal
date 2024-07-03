/*
  Warnings:

  - The `binderyTime` column on the `ProcessingOptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `binding` column on the `ProcessingOptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BindingType" AS ENUM ('PerfectBound', 'SaddleStitched', 'CoilBound', 'WireO', 'Other');

-- AlterTable
ALTER TABLE "ProcessingOptions" DROP COLUMN "binderyTime",
ADD COLUMN     "binderyTime" INTEGER,
DROP COLUMN "binding",
ADD COLUMN     "binding" "BindingType";
