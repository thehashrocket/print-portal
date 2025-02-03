-- CreateTable
CREATE TABLE "WalkInCustomer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalkInCustomer_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN "isWalkIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "walkInCustomerId" TEXT;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_walkInCustomerId_fkey" FOREIGN KEY ("walkInCustomerId") REFERENCES "WalkInCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE; 