import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

// Get an Order by ID
// Include Typesetting, ProcessionOptions, and OrderItems
export const orderRouter = createTRPCRouter({
  getByID: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.order.findUnique({
      where: {
        id: input,
      },
      include: {
        Typesetting: true,
        ProcessingOptions: true,
        OrderItems: true,
        office: true,
      },
    });
  }),
  // Return Orders
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.order.findMany();
  }),
});
