/*
  Warnings:

  - The values [Outsourced] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderItemStatus" ADD VALUE 'Outsourced';

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoiced', 'PaymentReceived', 'Pending', 'Shipping');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;
