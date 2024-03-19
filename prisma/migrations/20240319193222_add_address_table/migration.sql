-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "telephoneNumber" TEXT NOT NULL DEFAULT '',
    "addressType" "AddressType" NOT NULL DEFAULT 'Other',

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
