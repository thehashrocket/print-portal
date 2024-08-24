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
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: true,
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
        },
      });

      if (!order) return null;

      const totalAmount = order.OrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalCost = order.OrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));

      return normalizeOrder({ ...order, totalAmount, totalCost });
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
          OrderItems: true,
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
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem!.id;
      }

      const normalizedOrders = orders.map(order => normalizeOrder({
        ...order,
        totalAmount: order.OrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0)),
        totalCost: order.OrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0)),
      }));

      return {
        orders: normalizedOrders,
        nextCursor,
      };
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