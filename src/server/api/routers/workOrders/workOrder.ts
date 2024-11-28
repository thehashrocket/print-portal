import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { InvoicePrintEmailOptions, WorkOrderStatus, WorkOrderItemStatus, Prisma } from "@prisma/client";
import { convertWorkOrderToOrder } from "~/services/workOrderToOrderService";
import { normalizeWorkOrder, normalizeWorkOrderItem } from "~/utils/dataNormalization";
import { type SerializedWorkOrder, SerializedWorkOrderItem } from "~/types/serializedTypes";

const SALES_TAX = 0.07;

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
              createdBy: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      if (!workOrder) return null;

      const totalItemAmount = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalShippingAmount = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalCost = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);

      return normalizeWorkOrder({
        ...workOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalCost,
        totalShippingAmount
      });
    }),

  createWorkOrder: protectedProcedure
    .input(z.object({
      dateIn: z.date(),
      estimateNumber: z.string().optional(),
      contactPersonId: z.string(),
      inHandsDate: z.date(),
      invoicePrintEmail: z.nativeEnum(InvoicePrintEmailOptions),
      officeId: z.string(),
      purchaseOrderNumber: z.string(),
      shippingInfoId: z.string().optional().nullable(),
      status: z.nativeEnum(WorkOrderStatus),
      workOrderNumber: z.number().optional(),
      workOrderItems: z.array(z.object({
        quantity: z.number(),
        description: z.string(),
        expectedDate: z.date(),
        status: z.nativeEnum(WorkOrderItemStatus), // Changed from WorkOrderStatus to WorkOrderItemStatus
      })).optional(),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      // If the estimateNumber is not provided, auto generate it using a timestamp
      const estimateNumber = input.estimateNumber ? input.estimateNumber : `EST-${Date.now()}`;
      const workOrderNumber = input.workOrderNumber ? input.workOrderNumber : `${Date.now()}`;
      const createdWorkOrder = await ctx.db.workOrder.create({
        data: {
          dateIn: input.dateIn,
          estimateNumber,
          inHandsDate: input.inHandsDate,
          invoicePrintEmail: input.invoicePrintEmail,
          purchaseOrderNumber: input.purchaseOrderNumber,
          status: input.status,
          workOrderNumber: typeof workOrderNumber === 'string' ? parseInt(workOrderNumber, 10) : workOrderNumber,
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
              createdBy: true,
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
      const totalItemAmount = createdWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalCost = createdWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalShippingAmount = createdWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount);

      return normalizeWorkOrder({
        ...createdWorkOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount,
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
              createdBy: true,
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

      return Promise.all(workOrders.map(async workOrder => {
        const totalItemAmount = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
        const totalCost = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));
        const totalShippingAmount = workOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
        const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
        const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
        const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);

        const normalized = normalizeWorkOrder({
          ...workOrder,
          calculatedSalesTax,
          calculatedSubTotal,
          totalAmount,
          totalCost,
          totalItemAmount,
          totalShippingAmount,
        });
        return normalized;

      }));
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
              createdBy: true,
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

      const totalCost = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalItemAmount = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalShippingAmount = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const totalAmount = totalItemAmount.add(totalShippingAmount);

      return normalizeWorkOrder({
        ...updatedWorkOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount
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
              createdBy: true,
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

      const totalCost = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.cost || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalItemAmount = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.amount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalShippingAmount = updatedWorkOrder.WorkOrderItems.reduce((sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalAmount = totalItemAmount.add(totalShippingAmount);
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);

      return normalizeWorkOrder({
        ...updatedWorkOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount
      });
    }),

  convertWorkOrderToOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      officeId: z.string(),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedWorkOrder> => {
      const convertedWorkOrder = await convertWorkOrderToOrder(input.id, input.officeId);
      const fullWorkOrder = await ctx.db.workOrder.findUnique({
        where: { id: input.id },
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
              createdBy: true,
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
      if (!fullWorkOrder) {
        throw new Error("Work order not found");
      }
      return normalizeWorkOrder({
        ...fullWorkOrder,
        totalAmount: convertedWorkOrder.totalAmount,
        totalCost: convertedWorkOrder.totalCost,
        totalItemAmount: convertedWorkOrder.totalItemAmount,
        calculatedSalesTax: convertedWorkOrder.calculatedSalesTax,
        calculatedSubTotal: convertedWorkOrder.calculatedSubTotal,
        totalShippingAmount: null
      });
    }),
});