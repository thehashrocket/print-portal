// /src/server/api/routers/shared/shippingInfo.ts
// This file contains the shippingInfo router which is used to handle all shipping info related requests.
// ~/server/api/trpc.ts is a file that contains the createTRPCRouter function which is used to create a router for handling requests.
// The shippingInfo router has the following procedures:
// getById: This procedure gets a shipping info record by its ID.
// getAll: This procedure gets all shipping info records.
// create: This procedure creates a new shipping info record.
// update: This procedure updates an existing shipping info record.
// delete: This procedure deletes a shipping info record.



import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { ShippingMethod } from '@prisma/client';

export const shippingInfoRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.shippingInfo.findUnique({
            where: {
                id: input,
            },
            include: { ShippingPickup: true },
        });
    }),
    getByOfficeId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.shippingInfo.findMany({
            where: {
                officeId: input,
            },
            include: { ShippingPickup: true },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.shippingInfo.findMany({
            include: { ShippingPickup: true },
        });
    }),

    create: protectedProcedure
        .input(z.object({
            addressId: z.string().optional(),
            instructions: z.string().optional().default(''),
            officeId: z.string(),
            shippingCost: z.number().optional().default(0),
            shippingDate: z.date().optional().default(new Date()),
            shippingMethod: z.nativeEnum(ShippingMethod),
            shippingNotes: z.string().optional().default(''),
            shippingOther: z.string().optional().default(''),
            shipToSameAsBillTo: z.boolean().optional().default(false),
            shippingPickup: z.object({
                contactName: z.string(),
                contactPhone: z.string(),
                notes: z.string().optional(),
                pickupDate: z.date(),
                pickupTime: z.string(),
            }).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { shippingPickup, ...shippingInfoData } = input;

            const createdShippingInfo = await ctx.db.shippingInfo.create({
                data: {
                    ...shippingInfoData,
                    createdById: ctx.session.user.id,
                    ...(shippingPickup && {
                        ShippingPickup: {
                            create: {
                                ...shippingPickup,
                                createdById: ctx.session.user.id,
                            },
                        },
                    }),
                },
                include: { ShippingPickup: true },
            });

            return createdShippingInfo;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            instructions: z.string().optional(),
            shippingOther: z.string().optional(),
            shippingDate: z.date().optional(),
            shippingMethod: z.nativeEnum(ShippingMethod),
            shippingCost: z.number().optional(),
            shipToSameAsBillTo: z.boolean().optional(),
            addressId: z.string().optional(),
            shippingPickup: z.object({
                id: z.string().optional(),
                contactName: z.string(),
                contactPhone: z.string(),
                notes: z.string().optional(),
                pickupDate: z.date(),
                pickupTime: z.string(),
            }).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { shippingPickup, ...shippingInfoData } = input;

            const updatedShippingInfo = await ctx.db.shippingInfo.update({
                where: { id: input.id },
                data: {
                    ...shippingInfoData,
                    ...(shippingPickup && {
                        ShippingPickup: {
                            upsert: {
                                create: {
                                    ...shippingPickup,
                                    createdById: ctx.session.user.id,
                                },
                                update: shippingPickup,
                                where: {
                                    id: shippingPickup.id ?? '',
                                },
                            },
                        },
                    }),
                },
                include: { ShippingPickup: true },
            });

            return updatedShippingInfo;
        }),

    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            // First, delete any associated ShippingPickup
            await ctx.db.shippingPickup.deleteMany({
                where: { shippingInfoId: input },
            });

            // Then delete the ShippingInfo
            return ctx.db.shippingInfo.delete({
                where: { id: input },
            });
        }),
});

