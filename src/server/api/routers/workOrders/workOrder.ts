import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { InvoicePrintEmailOptions, WorkOrderStatus, WorkOrderItemStatus, Prisma, ShippingMethod } from "@prisma/client";
import { convertWorkOrderToOrder } from "~/services/workOrderToOrderService";
import { normalizeWorkOrder } from "~/utils/dataNormalization";
import { type SerializedWorkOrder } from "~/types/serializedTypes";
import { TRPCError } from "@trpc/server";

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
              ProductType: true,
              WorkOrderItemStock: true,
              createdBy: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
          WalkInCustomer: true,
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
        totalShippingAmount,
        contactPerson: workOrder.contactPerson || {
          id: workOrder.contactPersonId || '',
          name: null,
          email: null
        }
      });
    }),

  createWorkOrder: protectedProcedure
    .input(z.object({
      dateIn: z.date(),
      officeId: z.string(),
      inHandsDate: z.date(),
      invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
      status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']),
      contactPersonId: z.string().optional(),
      estimateNumber: z.string().optional(),
      purchaseOrderNumber: z.string().optional(),
      shippingInfoId: z.string().optional(),
      workOrderNumber: z.string().optional(),
      isWalkIn: z.boolean().optional(),
      walkInCustomerId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      const data: Prisma.WorkOrderCreateInput = {
        dateIn: input.dateIn,
        inHandsDate: input.inHandsDate,
        invoicePrintEmail: input.invoicePrintEmail,
        status: input.status,
        estimateNumber: input.estimateNumber,
        purchaseOrderNumber: input.purchaseOrderNumber,
        workOrderNumber: input.workOrderNumber,
        isWalkIn: input.isWalkIn ?? false,
        Office: {
          connect: { id: input.officeId }
        },
        createdBy: {
          connect: { id: ctx.session.user.id }
        }
      };

      if (input.contactPersonId) {
        data.contactPerson = {
          connect: { id: input.contactPersonId }
        };
      }

      if (input.shippingInfoId) {
        data.ShippingInfo = {
          connect: { id: input.shippingInfoId }
        };
      }

      if (input.walkInCustomerId) {
        data.WalkInCustomer = {
          connect: { id: input.walkInCustomerId }
        };
      }

      return ctx.db.workOrder.create({
        data,
        include: {
          Office: true,
          ShippingInfo: true,
          WorkOrderItems: true,
          contactPerson: true,
          createdBy: true,
          WalkInCustomer: true,
        },
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
              ProductType: true,
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
              ProductType: true,
              WorkOrderItemStock: true,
            },
          },
          WorkOrderNotes: true,
          WorkOrderVersions: true,
        },
      });

      // If the status is 'Cancelled', update the work order items to 'Cancelled'
      if (input.status === 'Cancelled') {
        await ctx.db.workOrderItem.updateMany({
          where: { workOrderId: updatedWorkOrder.id },
          data: { status: 'Cancelled' },
        });
      }

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
              ProductType: true,
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
              ProductType: true,
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

  updateContactPerson: protectedProcedure
    .input(z.object({
      workOrderId: z.string(),
      contactPersonId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedWorkOrder = await ctx.db.workOrder.update({
        where: { id: input.workOrderId },
        data: {
          contactPersonId: input.contactPersonId,
        },
      });
      return updatedWorkOrder;
    }),

  updateShippingInfo: protectedProcedure
    .input(z.object({
      workOrderId: z.string(),
      shippingInfo: z.object({
        addressId: z.string().optional(),
        instructions: z.string().optional(),
        shippingCost: z.number().optional(),
        shippingDate: z.date().optional(),
        shippingNotes: z.string().optional(),
        shippingMethod: z.string(),
        shippingOther: z.string().optional(),
        trackingNumber: z.array(z.string()).optional(),
        ShippingPickup: z.object({
          id: z.string().optional(),
          pickupDate: z.date(),
          pickupTime: z.string(),
          contactName: z.string(),
          contactPhone: z.string(),
          notes: z.string().optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {

      const { workOrderId, shippingInfo } = input;
      const workOrder = await ctx.db.workOrder.findUnique({
        where: { id: workOrderId },
        select: { officeId: true },
      });

      if (!workOrder) {
        throw new Error("Work order not found");
      }

      return await ctx.db.workOrder.update({
        where: { id: workOrderId },
        data: {
          ShippingInfo: {
            upsert: {
              create: {
                addressId: shippingInfo.addressId,
                instructions: shippingInfo.instructions,
                shippingCost: shippingInfo.shippingCost,
                shippingDate: shippingInfo.shippingDate,
                shippingNotes: shippingInfo.shippingNotes,
                shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
                shippingOther: shippingInfo.shippingOther,
                createdById: ctx.session.user.id,
                officeId: workOrder.officeId,
                trackingNumber: shippingInfo.trackingNumber || [],
                ShippingPickup: shippingInfo.ShippingPickup ? {
                  create: {
                    ...shippingInfo.ShippingPickup,
                    createdById: ctx.session.user.id,
                  }
                } : undefined
              },
              update: {
                addressId: shippingInfo.addressId,
                instructions: shippingInfo.instructions,
                shippingCost: shippingInfo.shippingCost,
                shippingDate: shippingInfo.shippingDate,
                shippingNotes: shippingInfo.shippingNotes,
                shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
                shippingOther: shippingInfo.shippingOther,
                trackingNumber: shippingInfo.trackingNumber || [],
                ShippingPickup: shippingInfo.ShippingPickup ? {
                  create: {
                    ...shippingInfo.ShippingPickup,
                    createdById: ctx.session.user.id,
                  }
                } : undefined
              }
            }
          }
        },
        include: {
          contactPerson: true,
          createdBy: true,
          Office: { include: { Company: true } },
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
    }),
});