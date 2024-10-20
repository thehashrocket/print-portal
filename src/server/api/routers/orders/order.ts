import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma, type ShippingMethod } from "@prisma/client";
import { normalizeOrder, normalizeOrderItem, normalizeOrderPayment } from "~/utils/dataNormalization";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";

const SALES_TAX = 0.07;

export const orderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<SerializedOrder | null> => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true
            },
          },
          OrderNotes: true,
        },
      });

      if (!order) return null;

      const nonCancelledOrderItems = order.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...order,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount,
        balance,
        totalPaid,
      });
    }),

  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }).nullish())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cursor = input?.cursor;

      const orders = await ctx.db.order.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                },
              },
            },
          },
          OrderNotes: true,
        },
      });

      return Promise.all(orders.map(async order => {
        const nonCancelledOrderItems = order.OrderItems.filter(item => item.status !== 'Cancelled');
        const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
        const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
        const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
        const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
        const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
        const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
        const totalOrderPayments = order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [];
        const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
        const balance = totalAmount.sub(totalPaid);

        return normalizeOrder({
          ...order,
          calculatedSalesTax,
          calculatedSubTotal,
          totalAmount,
          totalItemAmount,
          totalCost,
          totalShippingAmount,
          totalPaid,
          balance,
          createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name,
          },
        });
      }));
    }),

  updateDeposit: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        deposit: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedOrder> => {
      const { id, data } = input;
      const { deposit } = data;

      const updatedOrder = await ctx.db.order.update({
        where: { id },
        data: { deposit },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true,
            },
          },
          OrderNotes: true,
        },
      });

      const nonCancelledOrderItems = updatedOrder.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = updatedOrder.OrderPayments ? updatedOrder.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalCost,
        totalShippingAmount,
        totalPaid,
        balance,
      });
    }),

  updateShippingInfo: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      shippingInfo: z.object({
        addressId: z.string().optional(),
        shippingCost: z.number().optional(),
        shippingDate: z.date().optional(),
        shippingNotes: z.string().optional(),
        shippingMethod: z.string(), // Add this field
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId, shippingInfo } = input;

      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
        select: { officeId: true },
      });

      if (!order) throw new Error("Order not found");

      const updatedOrder = await ctx.db.order.update({
        where: { id: orderId },
        data: {
          ShippingInfo: {
            upsert: {
              create: {
                ...shippingInfo,
                createdById: ctx.session.user.id,
                officeId: order.officeId,
                shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
              },
              update: {
                addressId: shippingInfo.addressId,
                shippingCost: shippingInfo.shippingCost,
                shippingDate: shippingInfo.shippingDate,
                shippingNotes: shippingInfo.shippingNotes,
                shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
              },
            },
          },
        },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true,
            },
          },
          OrderNotes: true,
        },
      });

      const nonCancelledOrderItems = updatedOrder.OrderItems?.filter((item) => item.status !== 'Cancelled') ?? [];
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? new Prisma.Decimal(0)), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = updatedOrder.OrderPayments?.map(normalizeOrderPayment) ?? [];
      const totalPaid = totalOrderPayments.reduce((sum: Prisma.Decimal, payment: { amount: string | number }) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalCost,
        totalShippingAmount,
        totalPaid,
        balance,
        OrderPayments: null,
        Office: {
          Company: {
            name: ""
          }
        },
        contactPerson: {
          id: "",
          name: null
        },
        createdBy: {
          id: "",
          name: null
        }
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(OrderStatus),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedOrder> => {
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true,
            },
          },
          OrderNotes: true,
        },
      });
      const nonCancelledOrderItems = updatedOrder.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = updatedOrder.OrderPayments ? updatedOrder.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalShippingAmount,
        totalCost,
        totalPaid,
        balance,
      });
    }),

  dashboard: protectedProcedure
    .query(async ({ ctx }): Promise<SerializedOrderItem[]> => {
      const orders = await ctx.db.order.findMany({
        include: {
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
            }
          },
          Office: {
            include: {
              Company: true
            }
          }
        }
      });

      const allOrderItems: SerializedOrderItem[] = orders.flatMap(order =>
        order.OrderItems.map(item => {
          const normalizedItem = normalizeOrderItem(item);
          return {
            ...normalizedItem,
            officeId: order.officeId,
            officeName: order.Office.name,
            companyName: order.Office.Company.name,
          };
        })
      );

      return allOrderItems;
    }),
});