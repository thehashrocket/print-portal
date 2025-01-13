-- Create new enum types without the 'Invoicing' value
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoiced', 'PaymentReceived', 'Pending', 'Shipping');
CREATE TYPE "OrderItemStatus_new" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Invoiced', 'Pending', 'Prepress', 'Press', 'Shipping');

-- Update existing records to use 'Invoiced' instead of 'Invoicing'
UPDATE "Order" SET status = 'Invoiced'::"OrderStatus" WHERE status = 'Invoicing'::"OrderStatus";
UPDATE "OrderItem" SET status = 'Invoiced'::"OrderItemStatus" WHERE status = 'Invoicing'::"OrderItemStatus";

-- Drop default values
ALTER TABLE "Order" ALTER COLUMN status DROP DEFAULT;
ALTER TABLE "OrderItem" ALTER COLUMN status DROP DEFAULT;

-- Alter tables to use the new enum types
ALTER TABLE "Order" ALTER COLUMN status TYPE "OrderStatus_new" USING (status::text::"OrderStatus_new");
ALTER TABLE "OrderItem" ALTER COLUMN status TYPE "OrderItemStatus_new" USING (status::text::"OrderItemStatus_new");

-- Restore default values
ALTER TABLE "Order" ALTER COLUMN status SET DEFAULT 'Pending'::"OrderStatus_new";
ALTER TABLE "OrderItem" ALTER COLUMN status SET DEFAULT 'Pending'::"OrderItemStatus_new";

-- Drop old enum types
DROP TYPE "OrderStatus";
DROP TYPE "OrderItemStatus";

-- Rename new enum types to the original names
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
ALTER TYPE "OrderItemStatus_new" RENAME TO "OrderItemStatus"; 