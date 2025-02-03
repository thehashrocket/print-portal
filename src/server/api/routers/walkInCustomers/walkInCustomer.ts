import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const walkInCustomerRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.walkInCustomer.create({
                data: {
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                },
            });
        }),

    getById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.db.walkInCustomer.findUnique({
                where: { id: input },
            });
        }),

    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.walkInCustomer.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }),
}); 