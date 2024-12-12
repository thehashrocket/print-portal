import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { z } from "zod";
import { OrderItemStatus } from "@prisma/client";
import { sendOrderEmail } from "~/utils/sengrid";

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
                Order: {
                    select: {
                        Office: {
                            select: {
                                Company: {
                                    select: {
                                        name: true,
                                    }
                                }
                            }
                        },
                        WorkOrder: {
                            select: {
                                purchaseOrderNumber: true,
                            }
                        }
                    },
                },
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
    updateDescription: protectedProcedure
        .input(z.object({
            id: z.string(),
            description: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.orderItem.update({
                where: { id: input.id },
                data: { description: input.description }
            });
        }),
    updateSpecialInstructions: protectedProcedure
        .input(z.object({
            id: z.string(),
            specialInstructions: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.orderItem.update({
                where: { id: input.id },
                data: { specialInstructions: input.specialInstructions }
            });
        }),
    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(OrderItemStatus),
            sendEmail: z.boolean().default(false),
            emailOverride: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const updatedItem = await ctx.db.orderItem.update({
                where: {
                    id: input.id,
                },
                data: {
                    status: input.status,
                },
                include: {
                    Order: {
                        include: {
                            contactPerson: true,
                        },
                    },
                },
            });

            // If sendEmail is true and we have a contact email, send status update
            const emailToSend = input.emailOverride || updatedItem.Order?.contactPerson?.email;
            if (input.sendEmail && emailToSend) {
                const emailHtml = `
                    <h1>Order Item Status Update</h1>
                    <p>Your order item status has been updated to: ${input.status}</p>
                    <p>Description: ${updatedItem.description}</p>
                    <p>If you have any questions, please contact us.</p>
                `;

                await sendOrderEmail(
                    emailToSend,
                    `Job Status Update`,
                    emailHtml,
                    '' // No attachment needed for status update
                );
            }

            return updatedItem;
        }),
});