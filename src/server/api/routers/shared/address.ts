// used by Office, WorkOrders, and Orders.
// Path: src/server/api/routers/shared/address.ts
// Fields include: city, country, id, line1, line2, postalCode, state

import { off } from "process";
import { AddressType } from "@prisma/client";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const addressRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.address.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getByOfficeId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.address.findMany({
            where: {
                officeId: input,
            },
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.address.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            city: z.string(),
            country: z.string(),
            line1: z.string(),
            line2: z.string().optional(),
            line3: z.string().optional(),
            line4: z.string().optional(),
            officeId: z.string(),
            telephoneNumber: z.string(),
            zipCode: z.string(),
            state: z.string(),
            addressType: z.nativeEnum(AddressType),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.address.create({
                data: {
                    city: input.city,
                    country: input.country,
                    line1: input.line1,
                    line2: input.line2,
                    line3: input.line3,
                    line4: input.line4,
                    officeId: input.officeId,
                    telephoneNumber: input.telephoneNumber,
                    zipCode: input.zipCode,
                    state: input.state,
                    addressType: input.addressType,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            city: z.string(),
            country: z.string(),
            line1: z.string(),
            line2: z.string().optional(),
            line3: z.string().optional(),
            line4: z.string().optional(),
            officeId: z.string(),
            zipCode: z.string(),
            state: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.address.update({
                where: {
                    id: input.id,
                },
                data: input,
            });
        }),

    delete: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.address.delete({
            where: {
                id: input,
            },
        });
    }),
});