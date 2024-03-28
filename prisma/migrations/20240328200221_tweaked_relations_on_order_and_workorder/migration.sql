/*
  Warnings:

  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `deposit` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `costPerM` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingInfoId` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_shippingInfoId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
CREATE SEQUENCE workorder_version_seq;
ALTER TABLE "WorkOrder" ALTER COLUMN "deposit" SET NOT NULL,
ALTER COLUMN "deposit" SET DEFAULT 0,
ALTER COLUMN "costPerM" SET NOT NULL,
ALTER COLUMN "costPerM" SET DEFAULT 0,
ALTER COLUMN "version" SET DEFAULT nextval('workorder_version_seq'),
ALTER COLUMN "shippingInfoId" SET NOT NULL;
ALTER SEQUENCE workorder_version_seq OWNED BY "WorkOrder"."version";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_shippingInfoId_fkey" FOREIGN KEY ("shippingInfoId") REFERENCES "ShippingInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
