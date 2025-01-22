-- Migration to convert trackingNumber from string to string array

-- Step 1: Add new column
ALTER TABLE "ShippingInfo" ADD COLUMN "trackingNumber_new" TEXT[];

-- Step 2: Update all rows with a CASE statement
UPDATE "ShippingInfo"
SET "trackingNumber_new" = 
    CASE
        WHEN "trackingNumber" IS NULL OR "trackingNumber" = '' THEN '{}'::TEXT[]
        ELSE ARRAY[COALESCE("trackingNumber", '')]::TEXT[]
    END;

-- Step 3: Drop old and rename new
ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";
ALTER TABLE "ShippingInfo" RENAME COLUMN "trackingNumber_new" TO "trackingNumber";