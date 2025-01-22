-- Migration to convert trackingNumber from string to string array

DO $$
BEGIN
    -- Step 1: Add new column
    RAISE NOTICE 'Starting Step 1: Adding new column';
    ALTER TABLE "ShippingInfo" ADD COLUMN "trackingNumber_new" TEXT[];
    
    -- Step 2: Set default empty array for all rows
    RAISE NOTICE 'Starting Step 2: Updating values';
    UPDATE "ShippingInfo" SET "trackingNumber_new" = '{}';
    
    -- Step 3: Update existing tracking numbers
    UPDATE "ShippingInfo" 
    SET "trackingNumber_new" = '{' || quote_literal("trackingNumber") || '}'
    WHERE "trackingNumber" IS NOT NULL 
    AND "trackingNumber" != '';
    
    -- Step 4: Drop old and rename new
    RAISE NOTICE 'Starting Step 4: Dropping old column and renaming new one';
    ALTER TABLE "ShippingInfo" DROP COLUMN "trackingNumber";
    ALTER TABLE "ShippingInfo" RENAME COLUMN "trackingNumber_new" TO "trackingNumber";
    
    RAISE NOTICE 'Migration completed successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during migration: % %', SQLERRM, SQLSTATE;
    RAISE NOTICE 'Rolling back changes...';
    ALTER TABLE "ShippingInfo" DROP COLUMN IF EXISTS "trackingNumber_new";
    RAISE;
END $$;