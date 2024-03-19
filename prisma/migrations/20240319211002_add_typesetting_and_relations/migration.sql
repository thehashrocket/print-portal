-- CreateTable
CREATE TABLE "Typesetting" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "orderId" TEXT,
    "dateIn" TIMESTAMP(3) NOT NULL,
    "timeIn" TEXT NOT NULL,
    "cost" DECIMAL(10,2),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER,
    "plateRan" TEXT,

    CONSTRAINT "Typesetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypesettingOption" (
    "id" TEXT NOT NULL,
    "typesettingId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TypesettingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypesettingProof" (
    "id" TEXT NOT NULL,
    "typesettingId" TEXT NOT NULL,
    "proofNumber" INTEGER NOT NULL,
    "dateSubmitted" TIMESTAMP(3),
    "notes" TEXT,
    "approved" BOOLEAN,

    CONSTRAINT "TypesettingProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TypesettingOption_typesettingId_option_key" ON "TypesettingOption"("typesettingId", "option");

-- AddForeignKey
ALTER TABLE "Typesetting" ADD CONSTRAINT "Typesetting_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypesettingOption" ADD CONSTRAINT "TypesettingOption_typesettingId_fkey" FOREIGN KEY ("typesettingId") REFERENCES "Typesetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypesettingProof" ADD CONSTRAINT "TypesettingProof_typesettingId_fkey" FOREIGN KEY ("typesettingId") REFERENCES "Typesetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
