-- Migration to convert trackingNumber from string to string array

-- Step 1: Create a new column with the array type, initialized with empty arrays
ALTER TABLE "ShippingInfo" ADD COLUMN "trackingNumber_new" TEXT[] DEFAULT '{}';

-- Step 2: Update non-null values one by one
UPDATE "ShippingInfo" 
SET "trackingNumber_new" = string_to_array("trackingNumber", ',')
WHERE "trackingNumber" IS NOT NULL;

-- Step 3: Drop the old column and rename the new one
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";
ALTER TABLE "ShippingInfo" RENAME COLUMN "trackingNumber_new" TO "trackingNumber";