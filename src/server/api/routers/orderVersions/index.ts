import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const orderVersionsRouter = createTRPCRouter({
  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.orderVersion.findMany({
        where: { orderId: input.orderId },
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { changedAt: "asc" },
      });
    }),
});
