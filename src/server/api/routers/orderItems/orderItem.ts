import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderItemStatus, ShippingMethod, type Prisma } from "@prisma/client";
import { sendOrderStatusEmail } from "~/utils/sengrid";
import { type SerializedOrderItem } from "~/types/serializedTypes";
import { normalizeOrderItem } from "~/utils/dataNormalization";

const artworkSchema = z.object({
    fileUrl: z.string(),
    description: z.string().nullable(),
});

export const orderItemRouter = createTRPCRouter({
    // Get a OrderItem by ID
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedOrderItem | null> => {
            const orderItem = await ctx.db.orderItem.findUnique({
                where: { id: input },
                include: {
                    artwork: true,
                    OrderItemStock: true,
                    OutsourcedOrderItemInfo: {
                        include: {
                            files: true,
                        },
                    },
                    ProductType: true,
                    Order: {
                        include: {
                            Office: {
                                include: {
                                    Company: true
                                }
                            },
                            WorkOrder: {
                                select: {
                                    purchaseOrderNumber: true
                                }
                            },
                            contactPerson: true,
                            createdBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    },
                    ShippingInfo: {
                        include: {
                            Address: true,
                            ShippingPickup: true,
                            OrderItems: {
                                include: {
                                    artwork: true,
                                    OrderItemStock: true,
                                    ProductType: true,
                                    Order: {
                                        include: {
                                            Office: {
                                                include: {
                                                    Company: true
                                                }
                                            },
                                            WorkOrder: true
                                        }
                                    }
                                }
                            },
                            WorkOrderItems: {
                                include: {
                                    artwork: true,
                                    ProcessingOptions: true,
                                    ProductType: true,
                                    Typesetting: {
                                        include: {
                                            TypesettingOptions: true,
                                            TypesettingProofs: true
                                        }
                                    },
                                    WorkOrderItemStock: true,
                                    createdBy: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!orderItem) return null;
            return normalizeOrderItem({
                ...orderItem,
                OutsourcedOrderItemInfo: orderItem.OutsourcedOrderItemInfo?.[0] || null,
                Order: {
                    ...orderItem.Order,
                    WorkOrder: { 
                        purchaseOrderNumber: orderItem.Order.WorkOrder?.purchaseOrderNumber ?? null 
                    }
                },
                createdBy: {
                    ...orderItem.createdBy,
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
                    ShippingInfo: {
                        include: {
                            Address: true,
                            ShippingPickup: true,
                            OrderItems: {
                                include: {
                                    artwork: true,
                                    OrderItemStock: true,
                                    ProductType: true,
                                    Order: {
                                        include: {
                                            Office: {
                                                include: {
                                                    Company: true
                                                }
                                            },
                                            WorkOrder: true
                                        }
                                    }
                                }
                            },
                            WorkOrderItems: {
                                include: {
                                    artwork: true,
                                    ProcessingOptions: true,
                                    ProductType: true,
                                    Typesetting: {
                                        include: {
                                            TypesettingOptions: true,
                                            TypesettingProofs: true
                                        }
                                    },
                                    WorkOrderItemStock: true,
                                    createdBy: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
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
                    PaperProduct: true,
                    ProductType: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
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
                    notIn: ['Cancelled', 'Invoiced', 'Completed']
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
    // Get all Outsourced Order Items for Dashboard
    dashboardOutsourced: protectedProcedure.query(async ({ ctx }) => {
        const orderItems = await ctx.db.orderItem.findMany({
            where: {
                // Filter by outsourced info instead of status to avoid enum mismatch issues
                OutsourcedOrderItemInfo: {
                    some: {},
                },
            },
            include: {
                OutsourcedOrderItemInfo: true,
                Order: {
                    select: {
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
                        }
                    }
                }
            }
        });
        return orderItems;
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
    updateFields: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                quantity: z.number().optional(),
                ink: z.string().optional(),
                productTypeId: z.string().optional(),
                cost: z.number().optional(),
                amount: z.number().optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.orderItem.update({
                where: { id: input.id },
                data: input.data,
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
        }),
    updateShippingInfo: protectedProcedure
        .input(z.object({
            orderItemId: z.string(),
            shippingInfo: z.object({
                addressId: z.string().optional(),
                instructions: z.string().optional(),
                shippingCost: z.number().optional(),
                shippingDate: z.date().optional(),
                shippingNotes: z.string().optional(),
                shippingMethod: z.nativeEnum(ShippingMethod),
                shippingOther: z.string().optional(),
                trackingNumber: z.array(z.string()).optional(),
                shippingPickup: z.object({
                    pickupDate: z.date(),
                    pickupTime: z.string(),
                    contactName: z.string(),
                    contactPhone: z.string(),
                    notes: z.string().optional(),
                }).optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            // First get the order item and its associated order
            const orderItem = await ctx.db.orderItem.findUnique({
                where: { id: input.orderItemId },
                include: {
                    Order: {
                        select: {
                            officeId: true
                        }
                    }
                }
            });

            if (!orderItem?.Order) {
                throw new Error('Order item or associated order not found');
            }

            const { shippingInfo } = input;

            // Create or update the shipping info
            const createdShippingInfo = await ctx.db.shippingInfo.upsert({
                where: {
                    id: orderItem.shippingInfoId ?? '',
                },
                create: {
                    instructions: shippingInfo.instructions,
                    shippingOther: shippingInfo.shippingOther,
                    shippingDate: shippingInfo.shippingDate,
                    shippingMethod: shippingInfo.shippingMethod,
                    shippingCost: shippingInfo.shippingCost,
                    officeId: orderItem.Order.officeId,
                    addressId: shippingInfo.addressId,
                    createdById: ctx.session.user.id,
                    shippingNotes: shippingInfo.shippingNotes,
                    trackingNumber: shippingInfo.trackingNumber || [],
                    ShippingPickup: shippingInfo.shippingPickup ? {
                        create: {
                            pickupDate: shippingInfo.shippingPickup.pickupDate,
                            pickupTime: shippingInfo.shippingPickup.pickupTime,
                            contactName: shippingInfo.shippingPickup.contactName,
                            contactPhone: shippingInfo.shippingPickup.contactPhone,
                            notes: shippingInfo.shippingPickup.notes,
                            createdById: ctx.session.user.id,
                        }
                    } : undefined
                },
                update: {
                    instructions: shippingInfo.instructions,
                    shippingOther: shippingInfo.shippingOther,
                    shippingDate: shippingInfo.shippingDate,
                    shippingMethod: shippingInfo.shippingMethod,
                    shippingCost: shippingInfo.shippingCost,
                    addressId: shippingInfo.addressId,
                    shippingNotes: shippingInfo.shippingNotes,
                    trackingNumber: shippingInfo.trackingNumber || [],
                    ShippingPickup: shippingInfo.shippingPickup ? {
                        deleteMany: {},
                        create: {
                            pickupDate: shippingInfo.shippingPickup.pickupDate,
                            pickupTime: shippingInfo.shippingPickup.pickupTime,
                            contactName: shippingInfo.shippingPickup.contactName,
                            contactPhone: shippingInfo.shippingPickup.contactPhone,
                            notes: shippingInfo.shippingPickup.notes,
                            createdById: ctx.session.user.id,
                        }
                    } : {
                        deleteMany: {}
                    }
                },
                include: {
                    Address: true,
                    ShippingPickup: true,
                }
            });

            // Update the order item with the shipping info id
            const updatedOrderItem = await ctx.db.orderItem.update({
                where: { id: input.orderItemId },
                data: {
                    ShippingInfo: {
                        connect: {
                            id: createdShippingInfo.id
                        }
                    }
                } as Prisma.OrderItemUpdateInput,
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
                    ShippingInfo: {
                        include: {
                            Address: true,
                            ShippingPickup: true,
                        }
                    },
                    Order: {
                        include: {
                            Office: {
                                include: {
                                    Company: true
                                }
                            },
                            WorkOrder: {
                                select: {
                                    purchaseOrderNumber: true
                                }
                            }
                        }
                    }
                }
            });

            return updatedOrderItem;
        }),
    updateOutsourcedInfo: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                companyName: z.string().optional(),
                contactName: z.string().optional(),
                contactPhone: z.string().optional(),
                contactEmail: z.string().optional(),
                jobDescription: z.string().optional(),
                orderNumber: z.string().optional(),
                estimatedDeliveryDate: z.date().optional(),
                files: z.array(z.object({
                    fileUrl: z.string(),
                    description: z.string().optional(),
                })).optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if the OutsourcedOrderItemInfo already exists
            const existingOutsourcedInfo = await ctx.db.orderItem.findUnique({
                where: { id: input.id },
                include: {
                    OutsourcedOrderItemInfo: {
                        include: {
                            files: true,
                        },
                    },
                },
            });

            if (existingOutsourcedInfo?.OutsourcedOrderItemInfo?.[0]) {
                // Update the existing OutsourcedOrderItemInfo
                return ctx.db.outsourcedOrderItemInfo.update({
                    where: { id: existingOutsourcedInfo.OutsourcedOrderItemInfo[0].id },
                    data: {
                        ...input.data,
                        files: {
                            create: input.data.files,
                        },
                    },
                });
            }

            // Create a new OutsourcedOrderItemInfo
            return ctx.db.outsourcedOrderItemInfo.create({
                data: {
                    ...input.data,
                    orderItemId: input.id,
                    createdById: ctx.session.user.id,
                    files: {
                        create: input.data.files,
                    },
                },
            });
        }),
});
