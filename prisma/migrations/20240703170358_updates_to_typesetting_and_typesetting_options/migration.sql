/*
  Warnings:

  - You are about to drop the column `proofType` on the `TypesettingProof` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TypesettingStatus" AS ENUM ('InProgress', 'WaitingApproval', 'Completed');

-- CreateEnum
CREATE TYPE "ProofMethod" AS ENUM ('Digital', 'HardCopy', 'PDF', 'Other');

-- AlterTable
ALTER TABLE "Typesetting" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "followUpNotes" TEXT,
ADD COLUMN     "status" "TypesettingStatus" NOT NULL DEFAULT 'InProgress';

-- AlterTable
ALTER TABLE "TypesettingProof" DROP COLUMN "proofType",
ADD COLUMN     "proofMethod" "ProofMethod" NOT NULL DEFAULT 'Digital';

-- DropEnum
DROP TYPE "ProofType";
