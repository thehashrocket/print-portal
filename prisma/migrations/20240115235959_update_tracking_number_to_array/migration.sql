-- -- First, create a temporary column to store the array
-- ALTER TABLE "ShippingInfo" ADD COLUMN "tracking_numbers" TEXT[] DEFAULT '{}';

-- -- Copy existing tracking numbers to the new array column
-- UPDATE "ShippingInfo" 
-- SET "tracking_numbers" = ARRAY["trackingNumber"]
-- WHERE "trackingNumber" IS NOT NULL;

-- -- Drop the old column
-- ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";

-- -- Rename the new column to match our schema
-- ALTER TABLE "ShippingInfo" RENAME COLUMN "tracking_numbers" TO "trackingNumber";
