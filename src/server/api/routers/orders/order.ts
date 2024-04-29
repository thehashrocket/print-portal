import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus } from "@prisma/client"; // Import the OrderStatus enum

// Get an Order by ID
// Include Typesetting, ProcessionOptions, and OrderItems
export const orderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string()).query(({ ctx, input }) => {
      return ctx.db.order.findUnique({
        where: {
          id: input,
        },
        include: {
          OrderItems: {
            include: {
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true
                }
              },
              ProcessingOptions: true,
            }
          },
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
  getAll: protectedProcedure
    .query(({ ctx }) => {
      return ctx.db.order.findMany();
    }),
  // update status of an order
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(OrderStatus), // Use z.nativeEnum to validate the status
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.order.update({
        where: {
          id: input.id
        },
        data: {
          status: input.status
        }
      });
    }),
});
