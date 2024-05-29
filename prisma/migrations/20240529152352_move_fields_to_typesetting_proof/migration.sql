/*
  Warnings:

  - You are about to drop the column `proofCount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `proofType` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `proofCount` to the `TypesettingProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proofType` to the `TypesettingProof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "proofCount",
DROP COLUMN "proofType";

-- AlterTable
ALTER TABLE "TypesettingProof" ADD COLUMN     "proofCount" INTEGER NOT NULL,
ADD COLUMN     "proofType" "ProofType" NOT NULL;
