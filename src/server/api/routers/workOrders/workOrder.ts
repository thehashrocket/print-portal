import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { WorkOrderStatus } from "@prisma/client";

export const workOrderRouter = createTRPCRouter({
  // Get an Order by ID
  // Include workOrderItems, WorkOrderStock, WorkOrderVersions, Typesetting, ProcessiongOptions, and WorkOrderNote
  getByID: protectedProcedure
    .input(z.string()).query(({ ctx, input }) => {
      return ctx.db.workOrder.findUnique({
        where: {
          id: input,
        },
        include: {
          WorkOrderItems: {
            include: {
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true
                }
              },
              ProcessingOptions: true,
            },
            select: {
              id: true,
              amount: true,
              cs: true,
              finishedQty: true,
              inkColor: true,
              other: true,
              pressRun: true,
              quantity: true,
              size: true,
              stockOnHand: true,
              stockOrdered: true,
            }
          },
          WorkOrderVersions: true,

          WorkOrderNotes: {
            include: {
              createdBy: true
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
      return ctx.db.workOrder.findMany();
    }),
  // update status of a work order
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(WorkOrderStatus), // Use z.nativeEnum to validate the status
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.workOrder.update({
        where: {
          id: input.id
        },
        data: {
          status: input.status
        }
      });
    }),
});
