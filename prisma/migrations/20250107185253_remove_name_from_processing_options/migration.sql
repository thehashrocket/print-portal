/*
  Warnings:

  - You are about to drop the column `name` on the `ProcessingOptions` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileType" ADD VALUE 'JPEG';
ALTER TYPE "FileType" ADD VALUE 'JPG';
ALTER TYPE "FileType" ADD VALUE 'PNG';
ALTER TYPE "FileType" ADD VALUE 'PSD';

-- AlterTable
ALTER TABLE "ProcessingOptions" DROP COLUMN "name";
