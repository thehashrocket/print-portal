// Purpose: Router for WorkOrderItems. This file contains all the procedures for WorkOrderItems.
// This file is imported into the main API router in src/server/api/routers/index.ts.

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { WorkOrderItemStatus } from "@prisma/client";
import { normalizeWorkOrderItem } from "~/utils/dataNormalization";
import { type SerializedWorkOrderItem } from "~/types/serializedTypes";

const artworkSchema = z.object({
    fileUrl: z.string(),
    description: z.string().nullable(),
});

export const workOrderItemRouter = createTRPCRouter({
    getByID: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItem | null> => {
            const workOrderItem = await ctx.db.workOrderItem.findUnique({
                where: { id: input },
                include: {
                    artwork: true,
                    PaperProduct: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            return workOrderItem ? normalizeWorkOrderItem(workOrderItem) : null;
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        const workOrderItems = await ctx.db.workOrderItem.findMany({
            include: {
                artwork: true,
                PaperProduct: true,
                ProcessingOptions: true,
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
                WorkOrderItemStock: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return workOrderItems.map(normalizeWorkOrderItem);
    }),

    createWorkOrderItem: protectedProcedure
        .input(z.object({
            amount: z.number().default(1),
            artwork: z.array(artworkSchema),
            cost: z.number().default(1),
            description: z.string(),
            expectedDate: z.date(),
            ink: z.string().optional(),
            other: z.string(),
            paperProductId: z.string().optional(),
            prepTime: z.number(),
            productTypeId: z.string().optional(),
            quantity: z.number(),
            size: z.string(),
            specialInstructions: z.string(),
            status: z.nativeEnum(WorkOrderItemStatus),
            workOrderId: z.string(),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            const workOrderItem = await ctx.db.workOrderItem.create({
                data: {
                    amount: input.amount,
                    cost: input.cost,
                    createdById: ctx.session.user.id,
                    description: input.description,
                    expectedDate: input.expectedDate,
                    ink: input.ink,
                    other: input.other,
                    paperProductId: input.paperProductId,
                    prepTime: input.prepTime,
                    productTypeId: input.productTypeId,
                    quantity: input.quantity,
                    size: input.size,
                    specialInstructions: input.specialInstructions,
                    status: input.status,
                    workOrderId: input.workOrderId,
                    artwork: {
                        create: input.artwork,
                    }
                },
                include: {
                    artwork: true,
                    createdBy: true,
                    PaperProduct: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            return normalizeWorkOrderItem(workOrderItem);
        }),

    getByWorkOrderId: protectedProcedure
        .input(z.object({
            workOrderId: z.string()
        }))
        .query(async ({ ctx, input }): Promise<SerializedWorkOrderItem[]> => {
            const workOrderItems = await ctx.db.workOrderItem.findMany({
                where: { workOrderId: input.workOrderId },
                include: {
                    artwork: true,
                    PaperProduct: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return workOrderItems.map(normalizeWorkOrderItem);
        }),

    updateArtwork: protectedProcedure
        .input(z.object({
            workOrderItemId: z.string(),
            artwork: z.array(artworkSchema),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            // First, delete all existing artwork for this WorkOrderItem
            await ctx.db.workOrderItemArtwork.deleteMany({
                where: { workOrderItemId: input.workOrderItemId },
            });

            // Then, create new artwork entries
            const workOrderItem = await ctx.db.workOrderItem.update({
                where: { id: input.workOrderItemId },
                data: {
                    artwork: {
                        create: input.artwork,
                    },
                },
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });

            return normalizeWorkOrderItem(workOrderItem);
        }),
    
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                amount: z.number().optional(),
                cost: z.number().optional(),
                description: z.string().optional(),
                expectedDate: z.date().optional(),
                ink: z.string().optional(),
                other: z.string().optional(),
                paperProductId: z.string().optional(),
                productTypeId: z.string().optional(),
                quantity: z.number().optional(),
                size: z.string().optional(),
                specialInstructions: z.string().optional(),
                status: z.nativeEnum(WorkOrderItemStatus).optional(),
                workOrderId: z.string().optional(),
            }),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            const updatedItem = await ctx.db.workOrderItem.update({
                where: { id: input.id },
                data: {
                    amount: input.data.amount,
                    cost: input.data.cost,
                    description: input.data.description,
                    expectedDate: input.data.expectedDate,
                    ink: input.data.ink,
                    other: input.data.other,
                    paperProductId: input.data.paperProductId,
                    productTypeId: input.data.productTypeId,
                    quantity: input.data.quantity,
                    size: input.data.size,
                    specialInstructions: input.data.specialInstructions,
                    status: input.data.status,
                    workOrderId: input.data.workOrderId,
                },
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            return normalizeWorkOrderItem(updatedItem);
        }),

    updateDescription: protectedProcedure
        .input(z.object({
            id: z.string(),
            description: z.string(),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            const updatedItem = await ctx.db.workOrderItem.update({
                where: { id: input.id },
                data: { description: input.description },
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            return normalizeWorkOrderItem(updatedItem);
        }),

    updateSpecialInstructions: protectedProcedure
        .input(z.object({
            id: z.string(),
            specialInstructions: z.string(),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            console.log('input', input);
            const updatedItem = await ctx.db.workOrderItem.update({
                where: { id: input.id },
                data: { specialInstructions: input.specialInstructions },
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            console.log('input', input);
            console.log('updatedItem', updatedItem);
            return normalizeWorkOrderItem(updatedItem);
        }),

    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(WorkOrderItemStatus),
        }))
        .mutation(async ({ ctx, input }): Promise<SerializedWorkOrderItem> => {
            const updatedItem = await ctx.db.workOrderItem.update({
                where: { id: input.id },
                data: { status: input.status },
                include: {
                    artwork: true,
                    createdBy: true,
                    ProcessingOptions: true,
                    ProductType: true,
                    Typesetting: {
                        include: {
                            TypesettingOptions: true,
                            TypesettingProofs: {
                                include: {
                                    artwork: true,
                                }
                            },
                        }
                    },
                    WorkOrderItemStock: true,
                },
            });
            return normalizeWorkOrderItem(updatedItem);
        }),

    deleteArtwork: protectedProcedure
        .input(z.object({
            artworkId: z.string(),
        }))
        .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
            await ctx.db.workOrderItemArtwork.delete({
                where: { id: input.artworkId },
            });
            return { success: true };
        }),
});