// /src/server/api/routers/shared/shippingPickup.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { ShippingPickup, ShippingMethod } from '@prisma/client';

export const shippingPickupRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.shippingPickup.findUnique({
            where: {
                id: input,
            },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.shippingPickup.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            contactName: z.string(),
            contactPhone: z.string(),
            createdById: z.string(),
            notes: z.string().optional().default(''),
            pickupDate: z.date().default(new Date()),
            pickupTime: z.string(),
            shippingInfoId: z.string(),

        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.shippingPickup.create({
                data: {
                    contactName: input.contactName,
                    contactPhone: input.contactPhone,
                    createdById: input.createdById,
                    notes: input.notes,
                    pickupDate: input.pickupDate,
                    pickupTime: input.pickupTime,
                    shippingInfoId: input.shippingInfoId,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            contactName: z.string().optional(),
            contactPhone: z.string().optional(),
            notes: z.string().optional(),
            pickupDate: z.date().optional(),
            pickupTime: z.string().optional(),
            shippingInfoId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.shippingPickup.update({
                where: {
                    id: input.id,
                },
                data: {
                    contactName: input.contactName,
                    contactPhone: input.contactPhone,
                    notes: input.notes,
                    pickupDate: input.pickupDate,
                    pickupTime: input.pickupTime,
                    shippingInfoId: input.shippingInfoId,
                },
            });
        }
        ),
    delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.db.shippingPickup.delete({
            where: {
                id: input,
            },
        });
    }),
});
