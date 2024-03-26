import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

// Get an Order by ID
export const workOrderRouter = createTRPCRouter({
  getByID: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.workOrder.findUnique({
      where: {
        id: input,
      },
    });
  }),
  // Return Orders
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.workOrder.findMany();
  }),
});
