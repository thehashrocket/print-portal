import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { OrderItemStatus } from "@prisma/client";

export const orderItemRouter = createTRPCRouter({
    // Get a OrderItem by ID
    getByID: protectedProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            return ctx.db.orderItem.findUnique({
                where: {
                    id: input,
                },
                include: {
                    artwork: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true, // Include the artwork for TypesettingProofs
                                }
                            }
                        }
                    },
                    ProcessingOptions: true,
                    OrderItemStock: true,
                }
            });
        }),
    getByOrderId: protectedProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            return ctx.db.orderItem.findMany({
                where: {
                    orderId: input,  // Changed from id to orderId
                },
                include: {
                    artwork: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            }
                        }
                    },
                    ProcessingOptions: true
                }
            })
        }),
    // Get all OrderItems
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.db.orderItem.findMany({
            include: {
                artwork: true,
                Typesetting: {
                    include: {
                        TypesettingOptions: true,
                        TypesettingProofs: {
                            include: {
                                artwork: true,
                            }
                        }
                    }
                },
                ProcessingOptions: true
            }
        });
    }),
    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(OrderItemStatus),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.db.orderItem.update({
                where: {
                    id: input.id,
                },
                data: {
                    status: input.status,
                },
            });
        }),
});