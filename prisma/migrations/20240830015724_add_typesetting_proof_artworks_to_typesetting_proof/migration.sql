/*
  Warnings:

  - You are about to drop the column `customerSuppliedStock` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `customerSuppliedStock` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "customerSuppliedStock";

-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "customerSuppliedStock";

-- CreateTable
CREATE TABLE "TypesettingProofArtwork" (
    "id" TEXT NOT NULL,
    "typesettingProofId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypesettingProofArtwork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TypesettingProofArtwork" ADD CONSTRAINT "TypesettingProofArtwork_typesettingProofId_fkey" FOREIGN KEY ("typesettingProofId") REFERENCES "TypesettingProof"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
