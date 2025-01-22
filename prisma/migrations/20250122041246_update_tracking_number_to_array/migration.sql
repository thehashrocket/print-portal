-- This is an empty migration.

-- Step 1: Add the new array column
ALTER TABLE "ShippingInfo" ADD COLUMN "tracking_numbers" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Copy existing data to the new column
UPDATE "ShippingInfo"
SET "tracking_numbers" = ARRAY[COALESCE("trackingNumber", '')]
WHERE "trackingNumber" IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";

-- Step 4: Rename the new column to the original name
ALTER TABLE "ShippingInfo" RENAME COLUMN "tracking_numbers" TO "trackingNumber";