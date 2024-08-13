/*
  Warnings:

  - The values [Draft,Proofing,Approved] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `status` on the `WorkOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Proofing');

-- AlterEnum with CASCADE on DROP TYPE
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Invoicing', 'PaymentReceived', 'Pending', 'Prepress', 'Press', 'Shipping');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending';
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old" CASCADE;
COMMIT;

-- AlterTable
DO $$
BEGIN
    -- Ensure column exists before trying to drop it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'WorkOrder' AND column_name = 'status') THEN
        EXECUTE 'ALTER TABLE "WorkOrder" DROP COLUMN "status"';
    END IF;
END $$;

DO $$
BEGIN
    -- Ensure column does not exist before trying to add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'WorkOrder' AND column_name = 'status') THEN
        EXECUTE 'ALTER TABLE "WorkOrder" ADD COLUMN "status" "WorkOrderStatus" NOT NULL DEFAULT ''Draft''';
    END IF;
END $$;
