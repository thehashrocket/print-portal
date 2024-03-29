import { createTRPCRouter, publicProcedure } from "../../trpc";
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
        OrderNotes: {
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
    return ctx.db.order.findMany();
  }),
});
