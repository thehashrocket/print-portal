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

export const shippingInfoRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.shippingInfo.findUnique({
            where: {
                id: input,
            },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.shippingInfo.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            addressId: z.string().optional(),
            createdById: z.string(),
            instructions: z.string().optional().default(''),
            officeId: z.string(),
            shippingCost: z.number().optional(),
            shippingDate: z.date().optional().default(new Date()),
            shippingMethod: z.enum(['Courier', 'Deliver', 'DHL', 'FedEx', 'Other', 'UPS', 'USPS']),
            shippingOther: z.string().optional().default(''),
            shipToSameAsBillTo: z.boolean().optional().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.shippingInfo.create({
                data: {
                    addressId: input.addressId,
                    createdById: ctx.session.user.id, // Use the session user ID
                    instructions: input.instructions,
                    officeId: input.officeId,
                    shippingCost: input.shippingCost,
                    shippingDate: input.shippingDate,
                    shippingMethod: input.shippingMethod,
                    shippingOther: input.shippingOther,
                    shipToSameAsBillTo: input.shipToSameAsBillTo,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            instructions: z.string().optional(),
            shippingOther: z.string().optional(),
            shippingDate: z.date().optional(),
            shippingMethod: z.enum(['Courier', 'Deliver', 'DHL', 'FedEx', 'Other', 'UPS', 'USPS']),
            shippingCost: z.number().optional(),
            shipToSameAsBillTo: z.boolean().optional(),
            addressId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.shippingInfo.update({
                where: {
                    id: input.id,
                },
                data: {
                    instructions: input.instructions,
                    shippingOther: input.shippingOther,
                    shippingDate: input.shippingDate,
                    shippingMethod: input.shippingMethod,
                    shippingCost: input.shippingCost,
                    shipToSameAsBillTo: input.shipToSameAsBillTo,
                    addressId: input.addressId,
                },
            });
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.db.shippingInfo.delete({
            where: {
                id: input,
            },
        });
    }),
});

