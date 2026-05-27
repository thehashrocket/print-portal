-- CreateTable
CREATE TABLE "OrderVersion" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousStatus" "OrderStatus",
    "newStatus" "OrderStatus",
    "changedFields" JSONB,

    CONSTRAINT "OrderVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemVersion" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousStatus" "OrderItemStatus",
    "newStatus" "OrderItemStatus",
    "changedFields" JSONB,

    CONSTRAINT "OrderItemVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderVersion_orderId_changedAt_idx" ON "OrderVersion"("orderId", "changedAt");

-- CreateIndex
CREATE INDEX "OrderVersion_orderId_newStatus_idx" ON "OrderVersion"("orderId", "newStatus");

-- CreateIndex
CREATE INDEX "OrderItemVersion_orderItemId_changedAt_idx" ON "OrderItemVersion"("orderItemId", "changedAt");

-- CreateIndex
CREATE INDEX "OrderItemVersion_orderItemId_newStatus_idx" ON "OrderItemVersion"("orderItemId", "newStatus");

-- CreateIndex
CREATE INDEX "OrderItemVersion_orderId_changedAt_idx" ON "OrderItemVersion"("orderId", "changedAt");

-- AddForeignKey
ALTER TABLE "OrderVersion" ADD CONSTRAINT "OrderVersion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderVersion" ADD CONSTRAINT "OrderVersion_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVersion" ADD CONSTRAINT "OrderItemVersion_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVersion" ADD CONSTRAINT "OrderItemVersion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVersion" ADD CONSTRAINT "OrderItemVersion_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
