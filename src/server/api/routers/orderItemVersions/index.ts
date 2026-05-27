import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { OrderItemStatus } from "~/generated/prisma/client";

export const orderItemVersionsRouter = createTRPCRouter({
  getStatusHistory: protectedProcedure
    .input(z.object({
      orderItemId: z.string(),
      statuses: z.array(z.nativeEnum(OrderItemStatus)).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.orderItemVersion.findMany({
        where: {
          orderItemId: input.orderItemId,
          ...(input.statuses && input.statuses.length > 0 ? { newStatus: { in: input.statuses } } : {}),
        },
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { changedAt: "asc" },
      });
    }),

  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.orderItemVersion.findMany({
        where: { orderId: input.orderId },
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { changedAt: "asc" },
      });
    }),
});
