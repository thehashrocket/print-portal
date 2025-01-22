-- This is an empty migration.

-- Step 1: Add the new array column
ALTER TABLE "ShippingInfo" ADD COLUMN "tracking_numbers" TEXT[] DEFAULT '{}'::TEXT[];

-- Step 2: Copy existing data to the new column
UPDATE "ShippingInfo"
SET "tracking_numbers" = 
    CASE 
        WHEN "trackingNumber" IS NULL OR "trackingNumber" = '' THEN '{}'::TEXT[]
        ELSE ARRAY[NULLIF("trackingNumber", '')]::TEXT[]
    END;

-- Step 3: Drop the old column
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";

-- Step 4: Rename the new column to the original name
ALTER TABLE "ShippingInfo" RENAME COLUMN "tracking_numbers" TO "trackingNumber";