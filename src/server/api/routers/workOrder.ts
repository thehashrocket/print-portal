import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

// Get an Order by ID
export const workOrderRouter = createTRPCRouter({
  // Include workOrderItems, WorkOrderStock, WorkOrderVersions, Typesetting, ProcessiongOptions, and WorkOrderNote
  getByID: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.workOrder.findUnique({
      where: {
        id: input,
      },
      include: {
        WorkOrderItems: true,
        WorkOrderStock: true,
        WorkOrderVersions: true,
        Typesetting: true,
        ProcessingOptions: true,
        WorkOrderNotes: true,
      },
    });
  }),
  // Return Orders
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.workOrder.findMany();
  }),
});
