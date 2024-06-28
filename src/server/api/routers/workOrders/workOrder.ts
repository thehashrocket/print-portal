// /src/server/routers/workOrderRouter.ts
// This file contains the workOrderRouter which is used to handle all work order related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { InvoicePrintEmailOptions, WorkOrderStatus } from "@prisma/client";
import { convertWorkOrderToOrder } from "~/services/workOrderToOrderService";

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
      dateIn: z.date(),
      deposit: z.number(),
      description: z.string().nullable(),
      estimateNumber: z.string(),
      expectedDate: z.date().nullable(),
      inHandsDate: z.date(),
      invoicePrintEmail: z.nativeEnum(InvoicePrintEmailOptions),
      officeId: z.string(),
      purchaseOrderNumber: z.string(),
      shippingInfoId: z.string().optional().nullable(),
      specialInstructions: z.string().nullable(),
      status: z.nativeEnum(WorkOrderStatus),
      totalCost: z.number().nullable(),
      workOrderNumber: z.number(),
      workOrderItems: z.array(z.object({
        itemId: z.string(),
        quantity: z.number(),
        typesettingId: z.string(),
        processingOptionsId: z.string(),
        dateIn: z.date(),
        estimateNumber: z.string(),
        inHandsDate: z.date(),
        purchaseOrderNumber: z.string(),
        createdById: z.string()
      })).optional().nullable()
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.workOrder.create({
        data: {
          dateIn: input.dateIn,
          deposit: input.deposit,
          description: input.description,
          estimateNumber: input.estimateNumber,
          expectedDate: input.expectedDate,
          inHandsDate: input.inHandsDate,
          invoicePrintEmail: input.invoicePrintEmail,
          purchaseOrderNumber: input.purchaseOrderNumber,
          specialInstructions: input.specialInstructions,
          status: input.status,
          totalCost: input.totalCost,
          workOrderNumber: input.workOrderNumber,
          Office: {
            connect: {
              id: input.officeId
            }
          },
          ...(input.shippingInfoId && {
            ShippingInfo: {
              connect: {
                id: input.shippingInfoId
              }
            }
          }),
          createdBy: {
            connect: {
              id: ctx.session.user.id
            }
          },
          ...(input.workOrderItems && input.workOrderItems.length > 0 && {
            WorkOrderItems: {
              createMany: {
                data: input.workOrderItems.map((item) => ({
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
                  createdBy: {
                    connect: {
                      id: ctx.session.user.id
                    }
                  },
                  dateIn: item.dateIn,
                  estimateNumber: item.estimateNumber,
                  inHandsDate: item.inHandsDate,
                  purchaseOrderNumber: item.purchaseOrderNumber,
                  createdById: ctx.session.user.id
                }))
              }
            }
          })
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
  // add shippingInfoId to a work order
  addShippingInfo: protectedProcedure
    .input(z.object({
      id: z.string(),
      shippingInfoId: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.workOrder.update({
        where: {
          id: input.id
        },
        data: {
          ShippingInfo: {
            connect: {
              id: input.shippingInfoId
            }
          }
        }
      });
    }),
  // convert a work order to an order
  convertWorkOrderToOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      officeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return convertWorkOrderToOrder(input.id, input.officeId);
    }),
});
