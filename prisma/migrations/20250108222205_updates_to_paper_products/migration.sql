-- AlterEnum
ALTER TYPE "PaperBrand" ADD VALUE 'Other';

-- AlterEnum
ALTER TYPE "PaperFinish" ADD VALUE 'Other';

-- AlterEnum
ALTER TYPE "PaperType" ADD VALUE 'Other';

-- AlterTable
ALTER TABLE "PaperProduct" ALTER COLUMN "supplier" SET DEFAULT '',
ALTER COLUMN "customDescription" SET DEFAULT '';
