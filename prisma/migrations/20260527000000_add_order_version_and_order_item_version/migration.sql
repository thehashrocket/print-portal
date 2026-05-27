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
