import type { PrismaClient, Prisma } from "~/generated/prisma/client";
import type { OrderStatus, OrderItemStatus } from "~/generated/prisma/client";

type ChangedFields = Record<string, { from: unknown; to: unknown }>;

type CreateOrderVersionArgs = {
  db: PrismaClient;
  orderId: string;
  changedById: string;
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
  changedFields?: ChangedFields;
};

type CreateOrderItemVersionArgs = {
  db: PrismaClient;
  orderItemId: string;
  orderId: string;
  changedById: string;
  previousStatus?: OrderItemStatus;
  newStatus?: OrderItemStatus;
  changedFields?: ChangedFields;
};

export async function createOrderVersion({
  db, orderId, changedById, previousStatus, newStatus, changedFields,
}: CreateOrderVersionArgs) {
  return db.orderVersion.create({
    data: {
      orderId,
      changedById,
      previousStatus,
      newStatus,
      changedFields: changedFields as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function createOrderItemVersion({
  db, orderItemId, orderId, changedById, previousStatus, newStatus, changedFields,
}: CreateOrderItemVersionArgs) {
  return db.orderItemVersion.create({
    data: {
      orderItemId,
      orderId,
      changedById,
      previousStatus,
      newStatus,
      changedFields: changedFields as Prisma.InputJsonValue | undefined,
    },
  });
}

/**
 * Produce a changedFields diff from two partial objects.
 * Iterates `after` keys only — `after` is the partial mutation input, so only
 * those keys are being updated. Uses String() serialization to handle Prisma
 * Decimal values correctly.
 */
export function buildChangedFields<T extends Record<string, unknown>>(
  before: Partial<T>,
  after: Partial<T>,
): Record<string, { from: unknown; to: unknown }> | undefined {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    const bStr = String(before[key]);
    const aStr = String(after[key]);
    if (bStr !== aStr) {
      diff[key] = { from: bStr, to: aStr };
    }
  }
  return Object.keys(diff).length > 0 ? diff : undefined;
}
