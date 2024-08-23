import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";
import { normalizeOrder, normalizeOrderItem } from "~/utils/dataNormalization";


export const orderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
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
          OrderItems: true,
          Office: {
            include: {
              Company: true
            }
          },
        },
      });

      if (!order) return null;

      const totalCost = await ctx.db.orderItem.aggregate({
        where: { orderId: input },
        _sum: { amount: true }
      });

      const normalizedOrder = normalizeOrder({
        ...order,
        totalCost: totalCost._sum.amount ? new Prisma.Decimal(totalCost._sum.amount) : null,
      });

      normalizedOrder.OrderItems = order.OrderItems.map(normalizeOrderItem);

      return normalizedOrder;
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const orders = await ctx.db.order.findMany({
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
            include: {
              Company: true
            }
          },
          OrderItems: true
        }
      });

      const ordersWithTotalCost = await Promise.all(orders.map(async (order) => {
        const totalCost = await ctx.db.orderItem.aggregate({
          where: { orderId: order.id },
          _sum: { cost: true }
        });

        return {
          ...order,
          totalCost: totalCost._sum.cost || new Prisma.Decimal(0)
        };
      }));

      return ordersWithTotalCost;
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
  // Order Dashbaord
  // Shows all orders, their status, and the company they are associated with
  // Includes OrderItemStatus, returns the status that all OrderItems equal,
  // otherwise, it returns the lowest status of all OrderItems
  dashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const orders = await ctx.db.order.findMany({
        include: {
          OrderItems: true,
          Office: {
            include: {
              Company: true
            }
          }
        }
      });
      return orders.map(order => {
        const orderItemStatuses = order.OrderItems.map(orderItem => orderItem.status);
        const orderStatus = orderItemStatuses.every(status => status === orderItemStatuses[0]) ?
          orderItemStatuses[0] :
          orderItemStatuses.reduce((prev, current) => prev < current ? prev : current);
        return {
          ...order,
          OrderItemStatus: orderStatus
        };
      });
    }),
});