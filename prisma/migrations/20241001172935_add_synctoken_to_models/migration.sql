-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "syncToken" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "syncToken" TEXT;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "syncToken" TEXT;
