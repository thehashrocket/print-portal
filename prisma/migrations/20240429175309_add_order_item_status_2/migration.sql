-- Step 1: Create the new enum type
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoicing', 'PaymentReceived', 'Pending', 'Shipping');

-- Step 2: Alter the column to drop the default
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

-- Step 3: Alter the column type to text temporarily
ALTER TABLE "Order" ALTER COLUMN "status" TYPE TEXT;

-- Step 4: Update any existing values (if necessary)
UPDATE "Order"
SET "status" = 'Pending'
WHERE "status" NOT IN ('Cancelled', 'Completed', 'Pending', 'Shipping');

-- Step 5: Alter the column type to the new enum
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::TEXT::"OrderStatus_new");

-- Step 6: Set the new default
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending'::"OrderStatus_new";

-- Step 7: Drop the old enum type
DROP TYPE "OrderStatus";

-- Step 8: Rename the new enum type
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";