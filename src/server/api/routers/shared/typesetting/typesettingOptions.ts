// /src/server/api/routers/shared/typesetting/typesettingOptions.ts
// This file is imported into the main API router in src/server/api/routers/index.ts.

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const typesettingOptionsRouter = createTRPCRouter({
    getByID: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesettingOption.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.typesettingOption.findMany();
    }),

    create: protectedProcedure
        .input(z.object({
            typesettingId: z.string(),
            option: z.string(),
            selected: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesettingOption.create({
                data: {
                    typesettingId: input.typesettingId,
                    option: input.option,
                    selected: input.selected,
                    createdById: ctx.session.user.id,
                },
            });
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            typesettingId: z.string(),
            option: z.string(),
            selected: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.typesettingOption.update({
                where: {
                    id: input.id,
                },
                data: {
                    typesettingId: input.typesettingId,
                    option: input.option,
                    selected: input.selected,
                },
            });
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
        return ctx.db.typesettingOption.delete({
            where: {
                id: input,
            },
        });
    }),
});