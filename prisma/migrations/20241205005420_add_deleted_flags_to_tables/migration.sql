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

-- AlterTable
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermissionToRole_AB_unique";

-- AlterTable
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoleToUser_AB_unique";
