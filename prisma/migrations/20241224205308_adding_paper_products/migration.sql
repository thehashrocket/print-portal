-- CreateEnum
CREATE TYPE "PaperBrand" AS ENUM ('BlazerDigital', 'OmniluxOpaque');

-- CreateEnum
CREATE TYPE "PaperType" AS ENUM ('Book', 'Cover');

-- CreateEnum
CREATE TYPE "PaperFinish" AS ENUM ('Gloss', 'Satin', 'Opaque');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "paperProductId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "paperProductId" TEXT;

-- CreateTable
CREATE TABLE "PaperProduct" (
    "id" TEXT NOT NULL,
    "brand" "PaperBrand" NOT NULL,
    "paperType" "PaperType" NOT NULL,
    "finish" "PaperFinish" NOT NULL,
    "weightLb" INTEGER NOT NULL,
    "caliper" DOUBLE PRECISION NOT NULL,
    "size" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "mWeight" DOUBLE PRECISION NOT NULL,
    "sheetsPerUnit" INTEGER NOT NULL,
    "referenceId" TEXT NOT NULL,
    "isHPIndigo" BOOLEAN NOT NULL DEFAULT false,
    "supplier" TEXT NOT NULL DEFAULT 'Midland Paper',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PaperProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaperProduct_referenceId_key" ON "PaperProduct"("referenceId");

-- CreateIndex
CREATE INDEX "PaperProduct_brand_paperType_finish_weightLb_idx" ON "PaperProduct"("brand", "paperType", "finish", "weightLb");

-- CreateIndex
CREATE INDEX "PaperProduct_size_weightLb_finish_idx" ON "PaperProduct"("size", "weightLb", "finish");

-- CreateIndex
CREATE INDEX "PaperProduct_referenceId_idx" ON "PaperProduct"("referenceId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_paperProductId_fkey" FOREIGN KEY ("paperProductId") REFERENCES "PaperProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
