-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('Image', 'PDF', 'Excel', 'CSV', 'Word', 'RTF', 'Other');

-- AlterTable
ALTER TABLE "OrderItemArtwork" ADD COLUMN     "fileType" "FileType" NOT NULL DEFAULT 'Image';

-- AlterTable
ALTER TABLE "WorkOrderItemArtwork" ADD COLUMN     "fileType" "FileType" NOT NULL DEFAULT 'Image';
