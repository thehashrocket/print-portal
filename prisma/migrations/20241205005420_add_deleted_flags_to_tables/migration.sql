-- AlterEnum
ALTER TYPE "AddressType" ADD VALUE 'Physical';

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkOrderItem" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
