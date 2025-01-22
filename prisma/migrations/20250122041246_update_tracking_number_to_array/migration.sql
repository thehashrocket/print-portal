-- Migration to convert trackingNumber from string to string array
BEGIN;

-- Step 1: Create a new column with the array type
ALTER TABLE "ShippingInfo" ADD COLUMN "trackingNumber_new" TEXT[];

-- Step 2: Initialize all rows with an empty array
UPDATE "ShippingInfo" SET "trackingNumber_new" = '{}';

-- Step 3: Update non-null values
UPDATE "ShippingInfo" 
SET "trackingNumber_new" = ARRAY[trim("trackingNumber")]
WHERE "trackingNumber" IS NOT NULL 
AND trim("trackingNumber") != '';

-- Step 4: Drop the old column and rename the new one
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";
ALTER TABLE "ShippingInfo" RENAME COLUMN "trackingNumber_new" TO "trackingNumber";

COMMIT;