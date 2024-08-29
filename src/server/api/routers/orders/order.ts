import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";
import { normalizeOrder, normalizeOrderItem } from "~/utils/dataNormalization";
import { SerializedOrder, SerializedOrderItem } from "~/types/serializedTypes";

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

      return normalizeOrder({
        ...order,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount
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

        return normalizeOrder({
          ...order,
          calculatedSalesTax,
          calculatedSubTotal,
          totalAmount,
          totalItemAmount,
          totalCost,
          totalShippingAmount

        });
      }));
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
      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalShippingAmount,
        totalCost
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