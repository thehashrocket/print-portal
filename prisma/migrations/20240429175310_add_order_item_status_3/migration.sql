-- Step 1: Create the new enum type
CREATE TYPE "WorkOrderStatus_new" AS ENUM ('Approved', 'Cancelled', 'Draft', 'Pending');

-- Step 2: Alter the column to drop the default
ALTER TABLE "WorkOrder" ALTER COLUMN "status" DROP DEFAULT;

-- Step 3: Alter the column type to text temporarily
ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE TEXT;

-- Step 4: Update any existing values (if necessary)
UPDATE "WorkOrder"
SET "status" = 'Draft'
WHERE "status" NOT IN ('Approved', 'Cancelled', 'Draft', 'Pending');

-- Step 5: Alter the column type to the new enum
ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE "WorkOrderStatus_new" USING ("status"::TEXT::"WorkOrderStatus_new");

-- Step 6: Set the new default
ALTER TABLE "WorkOrder" ALTER COLUMN "status" SET DEFAULT 'Draft'::"WorkOrderStatus_new";

-- Step 7: Drop the old enum type
DROP TYPE "WorkOrderStatus";

-- Step 8: Rename the new enum type
ALTER TYPE "WorkOrderStatus_new" RENAME TO "WorkOrderStatus";