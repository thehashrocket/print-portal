/*
  Warnings:

  - You are about to drop the column `artwork` on the `WorkOrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrderItem" DROP COLUMN "artwork";

-- CreateTable
CREATE TABLE "WorkOrderItemArtwork" (
    "id" TEXT NOT NULL,
    "workOrderItemId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderItemArtwork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrderItemArtwork" ADD CONSTRAINT "WorkOrderItemArtwork_workOrderItemId_fkey" FOREIGN KEY ("workOrderItemId") REFERENCES "WorkOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
