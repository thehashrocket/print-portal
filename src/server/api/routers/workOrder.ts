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
        WorkOrderItems: {
          select: {
            id: true,
            amount: true,
            cs: true,
            cutting: true,
            description: true,
            drilling: true,
            finishedQty: true,
            folding: true,
            inkColor: true,
            other: true,
            pressRun: true,
            quantity: true,
            size: true,
            stockOnHand: true,
            stockOrdered: true,
          }
        },
        WorkOrderStock: true,
        WorkOrderVersions: true,
        Typesetting: true,
        ProcessingOptions: true,
        WorkOrderNotes: {
          include: {
            User: true
          }
        },
        ShippingInfo: {
          include: {
            Address: {
              select: {
                line1: true,
                line2: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                telephoneNumber: true,
                addressType: true
              }
            }
          }
        },
        Office: {
          include: {
            Company: true // Include the Company model associated with the Office
          }
        }
      },
    });
  }),
  // Return Orders
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.workOrder.findMany();
  }),
});
