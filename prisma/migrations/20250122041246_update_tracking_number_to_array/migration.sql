-- Migration to convert trackingNumber from string to string array

-- Step 1: Add new column with default empty array
ALTER TABLE "ShippingInfo" ADD COLUMN "trackingNumber_new" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Update non-empty values
UPDATE "ShippingInfo"
SET "trackingNumber_new" = ARRAY[TRIM("trackingNumber")]::TEXT[]
WHERE "trackingNumber" IS NOT NULL
AND TRIM("trackingNumber") != '';

-- Step 3: Drop old and rename new
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";
ALTER TABLE "ShippingInfo" RENAME COLUMN "trackingNumber_new" TO "trackingNumber";