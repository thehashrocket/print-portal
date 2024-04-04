import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const typesettingOptionsRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
        return ctx.db.typesettingOption.findUnique({
            where: {
                id: input,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
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