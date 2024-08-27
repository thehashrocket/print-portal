import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { InvoicePrintEmailOptions, WorkOrderStatus, WorkOrderItemStatus, Prisma } from "@prisma/client";
import { convertWorkOrderToOrder } from "~/services/workOrderToOrderService";
import { normalizeWorkOrder, normalizeWorkOrderItem } from "~/utils/dataNormalization";
import { SerializedWorkOrder, SerializedWorkOrderItem } from "~/types/serializedTypes";

export const workOrderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<SerializedWorkOrder | null> => {
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: input },
        include: {
          contactPerson: true,
          createdBy: true,
          Office: {
            include: {
              Company: true,
            },
          },
          Order: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          WorkOrderItems: {
            include: {
              artwork: true,
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true,
                }
              },
              ProcessingOptions: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      if (!workOrder) return null;

      const totalAmount = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input },
        _sum: { amount: true }
      });

      const totalCost = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input },
        _sum: { cost: true }
      });

      return normalizeWorkOrder({
        ...workOrder,
        totalAmount: totalAmount._sum.amount || new Prisma.Decimal(0),
        totalCost: totalCost._sum.cost || new Prisma.Decimal(0),
      });
    }),

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
        quantity: z.number(),
        description: z.string(),
        expectedDate: z.date(),
        status: z.nativeEnum(WorkOrderItemStatus), // Changed from WorkOrderStatus to WorkOrderItemStatus
      })).optional(),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      const createdWorkOrder = await ctx.db.workOrder.create({
        data: {
          dateIn: input.dateIn,
          estimateNumber: input.estimateNumber,
          inHandsDate: input.inHandsDate,
          invoicePrintEmail: input.invoicePrintEmail,
          purchaseOrderNumber: input.purchaseOrderNumber,
          status: input.status,
          workOrderNumber: input.workOrderNumber,
          Office: { connect: { id: input.officeId } },
          ShippingInfo: input.shippingInfoId ? { connect: { id: input.shippingInfoId } } : undefined,
          contactPerson: { connect: { id: input.contactPersonId } },
          createdBy: { connect: { id: ctx.session.user.id } },
          WorkOrderItems: {
            create: input.workOrderItems?.map(item => ({
              ...item,
              createdBy: { connect: { id: ctx.session.user.id } },
            })) || [],
          },
        },
        include: {
          contactPerson: true,
          createdBy: true,
          Office: {
            include: {
              Company: true,
            },
          },
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          WorkOrderItems: {
            include: {
              artwork: true,
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true,
                }
              },
              ProcessingOptions: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      // Calculate totalAmount and totalCost
      const totalAmount = createdWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalCost = createdWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));

      return normalizeWorkOrder({
        ...createdWorkOrder,
        totalAmount,
        totalCost,
        Order: null, // Since this is a new work order, it won't have an associated order yet
      });
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }): Promise<SerializedWorkOrder[]> => {
      const workOrders = await ctx.db.workOrder.findMany({
        include: {
          contactPerson: true,
          createdBy: true,
          Office: {
            include: {
              Company: true,
            },
          },
          Order: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          WorkOrderItems: {
            include: {
              artwork: true,
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true,
                }
              },
              ProcessingOptions: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      const normalizedWorkOrders = await Promise.all(workOrders.map(async (workOrder) => {
        const totalAmount = await ctx.db.workOrderItem.aggregate({
          where: { workOrderId: workOrder.id },
          _sum: { amount: true }
        });

        const totalCost = await ctx.db.workOrderItem.aggregate({
          where: { workOrderId: workOrder.id },
          _sum: { cost: true }
        });

        return normalizeWorkOrder({
          ...workOrder,
          totalAmount: totalAmount._sum.amount || new Prisma.Decimal(0),
          totalCost: totalCost._sum.cost || new Prisma.Decimal(0),
        });
      }));

      return normalizedWorkOrders;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(WorkOrderStatus),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      const updatedWorkOrder = await ctx.db.workOrder.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          contactPerson: true,
          createdBy: true,
          Office: {
            include: {
              Company: true,
            },
          },
          Order: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          WorkOrderItems: {
            include: {
              artwork: true,
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true,
                }
              },
              ProcessingOptions: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      const totalAmount = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input.id },
        _sum: { amount: true }
      });

      const totalCost = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input.id },
        _sum: { cost: true }
      });

      return normalizeWorkOrder({
        ...updatedWorkOrder,
        totalAmount: totalAmount._sum.amount || new Prisma.Decimal(0),
        totalCost: totalCost._sum.cost || new Prisma.Decimal(0),
      });
    }),

  addShippingInfo: protectedProcedure
    .input(z.object({
      id: z.string(),
      shippingInfoId: z.string(),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      const updatedWorkOrder = await ctx.db.workOrder.update({
        where: { id: input.id },
        data: {
          ShippingInfo: { connect: { id: input.shippingInfoId } }
        },
        include: {
          contactPerson: true,
          createdBy: true,
          Office: {
            include: {
              Company: true,
            },
          },
          Order: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          WorkOrderItems: {
            include: {
              artwork: true,
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true,
                }
              },
              ProcessingOptions: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      const totalAmount = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input.id },
        _sum: { amount: true }
      });

      const totalCost = await ctx.db.workOrderItem.aggregate({
        where: { workOrderId: input.id },
        _sum: { cost: true }
      });

      return normalizeWorkOrder({
        ...updatedWorkOrder,
        totalAmount: totalAmount._sum.amount || new Prisma.Decimal(0),
        totalCost: totalCost._sum.cost || new Prisma.Decimal(0),
      });
    }),

  convertWorkOrderToOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      officeId: z.string(),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      const convertedWorkOrder = await convertWorkOrderToOrder(input.id, input.officeId);
      return normalizeWorkOrder(convertedWorkOrder);
    }),
});