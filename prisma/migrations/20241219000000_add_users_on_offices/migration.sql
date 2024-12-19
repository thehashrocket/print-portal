-- CreateTable
CREATE TABLE "UsersOnOffices" (
    "userId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnOffices_pkey" PRIMARY KEY ("userId","officeId")
);

-- CreateIndex
CREATE INDEX "UsersOnOffices_officeId_idx" ON "UsersOnOffices"("officeId");

-- CreateIndex
CREATE INDEX "UsersOnOffices_userId_idx" ON "UsersOnOffices"("userId");

-- Migrate existing relationships
INSERT INTO "UsersOnOffices" ("userId", "officeId")
SELECT id as "userId", "officeId"
FROM "User"
WHERE "officeId" IS NOT NULL;

-- Add foreign key constraints
ALTER TABLE "UsersOnOffices" ADD CONSTRAINT "UsersOnOffices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UsersOnOffices" ADD CONSTRAINT "UsersOnOffices_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove old column
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_officeId_fkey";
ALTER TABLE "User" DROP COLUMN "officeId"; 