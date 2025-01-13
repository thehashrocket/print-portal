-- Create new enum types with the 'Invoicing' value
CREATE TYPE "OrderStatus_new" AS ENUM ('Cancelled', 'Completed', 'Invoicing', 'PaymentReceived', 'Pending', 'Shipping');
CREATE TYPE "OrderItemStatus_new" AS ENUM ('Bindery', 'Cancelled', 'Completed', 'Invoicing', 'Pending', 'Prepress', 'Press', 'Shipping');

-- Update existing records to use 'Invoicing' instead of 'Invoiced'
UPDATE "Order" SET status = 'Invoicing'::"OrderStatus_new" WHERE status = 'Invoiced'::"OrderStatus";
UPDATE "OrderItem" SET status = 'Invoicing'::"OrderItemStatus_new" WHERE status = 'Invoiced'::"OrderItemStatus";

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