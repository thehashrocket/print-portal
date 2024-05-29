// /src/server/routers/workOrderRouter.ts
// This file contains the workOrderRouter which is used to handle all work order related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.

import { createTRPCRouter, protectedProcedure } from "../../trpc";
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
          createdBy: true,
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
  // Create a new Work Order
  createWorkOrder: protectedProcedure
    .input(z.object({
      workOrder: z.object({
        workOrderNumber: z.number(),
        status: z.nativeEnum(WorkOrderStatus),
        officeId: z.string(),
        shippingInfoId: z.string(),
        dateIn: z.date(), // Add the missing properties
        estimateNumber: z.string(),
        inHandsDate: z.date(),
        purchaseOrderNumber: z.string(),
        workOrderItems: z.array(z.object({
          itemId: z.string(),
          quantity: z.number(),
          typesettingId: z.string(),
          processingOptionsId: z.string(),
          dateIn: z.date(),
          estimateNumber: z.string(),
          inHandsDate: z.date(),
          purchaseOrderNumber: z.string(),
          createdById: z.string() // Add the createdById property
        }))
      })
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.workOrder.create({
        data: {
          workOrderNumber: input.workOrder.workOrderNumber,
          status: input.workOrder.status,
          dateIn: input.workOrder.dateIn, // Include the missing properties
          estimateNumber: input.workOrder.estimateNumber,
          inHandsDate: input.workOrder.inHandsDate,
          purchaseOrderNumber: input.workOrder.purchaseOrderNumber,
          Office: {
            connect: {
              id: input.workOrder.officeId
            }
          },
          ShippingInfo: {
            connect: {
              id: input.workOrder.shippingInfoId
            }
          },
          createdBy: { // Include the createdBy property
            connect: {
              id: ctx.session.user.id
            }
          },
          WorkOrderItems: {
            createMany: {
              data: input.workOrder.workOrderItems.map((item) => {
                return {
                  quantity: item.quantity,
                  Item: {
                    connect: {
                      id: item.itemId
                    }
                  },
                  Typesetting: {
                    connect: {
                      id: item.typesettingId
                    }
                  },
                  ProcessingOptions: {
                    connect: {
                      id: item.processingOptionsId
                    }
                  },
                  createdBy: { // Include the createdBy property
                    connect: {
                      id: ctx.session.user.id
                    }
                  },
                  dateIn: item.dateIn,
                  estimateNumber: item.estimateNumber,
                  inHandsDate: item.inHandsDate,
                  purchaseOrderNumber: item.purchaseOrderNumber,
                  createdById: ctx.session.user.id // Add the createdById property
                }
              })
            }
          }
        }
      });
    }),
  // Return WorkOrders
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
  // Work Order Dashboard
  //
});
