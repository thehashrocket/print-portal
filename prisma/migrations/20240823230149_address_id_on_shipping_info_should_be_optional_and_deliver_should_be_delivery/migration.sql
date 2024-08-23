/*
  Warnings:

  - The values [Deliver] on the enum `ShippingMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShippingMethod_new" AS ENUM ('Courier', 'Delivery', 'DHL', 'FedEx', 'Other', 'Pickup', 'UPS', 'USPS');
ALTER TABLE "ShippingInfo" ALTER COLUMN "shippingMethod" TYPE "ShippingMethod_new" USING ("shippingMethod"::text::"ShippingMethod_new");
ALTER TYPE "ShippingMethod" RENAME TO "ShippingMethod_old";
ALTER TYPE "ShippingMethod_new" RENAME TO "ShippingMethod";
DROP TYPE "ShippingMethod_old";
COMMIT;
