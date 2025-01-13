import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderItemStatus } from "@prisma/client";
import { sendOrderStatusEmail } from "~/utils/sengrid";

const artworkSchema = z.object({
    fileUrl: z.string(),
    description: z.string().nullable(),
});

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
                    PaperProduct: true,
                    ProductType: true,
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
                    ProcessingOptions: true,
                    PaperProduct: true,
                    ProductType: true,
                }
            })
        }),
    // Get all OrderItems
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orderItems = await ctx.db.orderItem.findMany({
            include: {
                artwork: true,
                Order: {
                    select: {
                        status: true,
                        orderNumber: true,
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
                        },
                        OrderItems: true
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
                ProcessingOptions: true,
                ProductType: true,
            }
        });

        return orderItems;
    }),
    // Get all OrderItems that are not Cancelled or Completed
    dashboard: protectedProcedure.query(async ({ ctx }) => {
        const orderItems = await ctx.db.orderItem.findMany({
            where: {
                status: {
                    notIn: ['Cancelled', 'Invoicing']
                }
            },
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
                        },
                        OrderItems: true,
                        orderNumber: true,
                        status: true
                    },
                },
            }
        });

        // for each order item, find what the order item's position is in the list of order items for the order it belongs to
        // and add it to the order item as a new property
        // also add the total number of items in the order to the order item as a new property
        const orderItemPositions = orderItems.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            orderItemNumber: item.orderItemNumber,
            position: item.Order?.OrderItems.findIndex(orderItem => orderItem.id === item.id) + 1 || 0,
            totalItems: item.Order?.OrderItems.length || 0,
            expectedDate: item.expectedDate,
            status: item.status,
            description: item.description,
            companyName: item.Order?.Office?.Company?.name || '',
            purchaseOrderNumber: item.Order?.WorkOrder?.purchaseOrderNumber || '',
            orderNumber: item.Order?.orderNumber || '',
            orderStatus: item.Order?.status || 'Draft',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            // Convert Decimal values to numbers
            amount: item.amount ? Number(item.amount) : null,
            cost: item.cost ? Number(item.cost) : null,
            shippingAmount: item.shippingAmount ? Number(item.shippingAmount) : null,
        }));

        return orderItemPositions;
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

                const dynamicTemplateData = {
                    subject: `Job Status Update`,
                    html: emailHtml,
                    orderNumber: updatedItem.Order?.orderNumber.toString() || '',
                    status: input.status,
                    trackingNumber: null,
                    shippingMethod: null,
                };

                await sendOrderStatusEmail(
                    emailToSend,
                    `Job Status Update`,
                    dynamicTemplateData,
                );
            }

            return updatedItem;
        }),
    updateArtwork: protectedProcedure
        .input(z.object({
            orderItemId: z.string(),
            artwork: z.array(artworkSchema),
        }))
        .mutation(async ({ ctx, input }) => {
            // First, delete all existing artwork for this OrderItem
            await ctx.db.orderItemArtwork.deleteMany({
                where: { orderItemId: input.orderItemId },
            });

            // Then, create new artwork entries
            const orderItem = await ctx.db.orderItem.update({
                where: { id: input.orderItemId },
                data: {
                    artwork: {
                        create: input.artwork,
                    },
                },
                include: {
                    artwork: true,
                    PaperProduct: true,
                    ProductType: true,
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
                    ProcessingOptions: true,
                    OrderItemStock: true,
                }
            });

            return orderItem;
        }),
});