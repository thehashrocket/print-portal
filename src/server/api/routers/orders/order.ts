import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";

export const orderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          createdBy: true,
          OrderItems: {
            include: {
              Typesetting: {
                include: {
                  TypesettingOptions: true,
                  TypesettingProofs: true
                }
              },
              ProcessingOptions: true,
            }
          },
          OrderNotes: {
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
              Company: true
            }
          }
        },
      });

      if (!order) return null;

      const totalCost = await ctx.db.orderItem.aggregate({
        where: { orderId: input },
        _sum: { cost: true }
      });

      return {
        ...order,
        totalCost: totalCost._sum.cost || new Prisma.Decimal(0)
      };
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const orders = await ctx.db.order.findMany({
        include: {
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