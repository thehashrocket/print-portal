import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
    createContact: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string().email(),
            officeId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    Office: {
                        connect: { id: input.officeId }
                    },
                },
            });
        }),
}); 