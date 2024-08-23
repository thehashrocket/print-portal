// /src/server/routers/workOrderRouter.ts
// This file contains the workOrderRouter which is used to handle all work order related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { InvoicePrintEmailOptions, WorkOrderStatus } from "@prisma/client";
import { convertWorkOrderToOrder } from "~/services/workOrderToOrderService";
import { Prisma } from "@prisma/client";
import { normalizeWorkOrder, normalizeWorkOrderItem } from "~/utils/dataNormalization";


export const workOrderRouter = createTRPCRouter({
  // Get an Order by ID
  // Include workOrderItems, WorkOrderStock, WorkOrderVersions, Typesetting, ProcessiongOptions, and WorkOrderNote
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: input },
        include: {
          contactPerson: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
          Office: {
            select: {
              id: true,
              name: true,
              Company: {
                select: {
                  name: true
                }
              }
            }
          },
          Order: true,
          WorkOrderItems: true,
        },
      });

      if (!workOrder) return null;

      const totalCost = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input },
        _sum: { amount: true }
      });

      const normalizedWorkOrder = normalizeWorkOrder({
        ...workOrder,
        totalCost: totalCost._sum.amount || new Prisma.Decimal(0),
        contactPersonId: workOrder.contactPersonId,
        contactPerson: {
          id: workOrder.contactPersonId,
          name: workOrder.contactPerson.name || null
        },
        createdBy: {
          id: workOrder.createdBy.id,
          name: workOrder.createdBy.name
        },
        Office: {
          id: workOrder.officeId,
          name: workOrder.Office.name,
          Company:
          {
            name: workOrder.Office.Company.name
          }
        }
      });

      normalizedWorkOrder.WorkOrderItems = workOrder.WorkOrderItems.map(normalizeWorkOrderItem);

      return normalizedWorkOrder;
    }),
  // Create a new Work Order
  createWorkOrder: protectedProcedure
    .input(z.object({
      dateIn: z.date(),
      estimateNumber: z.string(),
      contactPersonId: z.string(),
      inHandsDate: z.date(),
      invoicePrintEmail: z.nativeEnum(InvoicePrintEmailOptions),
      officeId: z.string(),
      purchaseOrderNumber: z.string(),
      shippingInfoId: z.string().optional().nullable(),
      status: z.nativeEnum(WorkOrderStatus),
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
          estimateNumber: input.estimateNumber,
          inHandsDate: input.inHandsDate,
          invoicePrintEmail: input.invoicePrintEmail,
          purchaseOrderNumber: input.purchaseOrderNumber,
          status: input.status,
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
          contactPerson: {
            connect: {
              id: input.contactPersonId
            }
          },
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
  // Include Order Id if the Work Order is converted to an Order
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const workOrders = await ctx.db.workOrder.findMany({
        include: {
          WorkOrderItems: true,
          Office: {
            select: {
              id: true,
              name: true,
              Company: {
                select: {
                  name: true
                }
              }
            }
          },
          Order: {
            select: {
              id: true
            }
          },
          contactPerson: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
        },
      });

      const normalizedWorkOrders = await Promise.all(workOrders.map(async (workOrder) => {
        const totalCost = await ctx.db.workOrderItem.aggregate({
          where: { workOrderId: workOrder.id },
          _sum: { amount: true }
        });

        return normalizeWorkOrder({
          ...workOrder,
          totalCost: totalCost._sum.amount || new Prisma.Decimal(0),
          createdBy: {
            id: workOrder.createdBy.id,
            name: workOrder.createdBy.name
          },
          Office: {
            id: workOrder.Office.id,
            name: workOrder.Office.name,
            Company: {
              name: workOrder.Office.Company.name
            }
          },
          Order: workOrder.Order,
          WorkOrderItems: workOrder.WorkOrderItems
        });
      }));

      return normalizedWorkOrders;
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
