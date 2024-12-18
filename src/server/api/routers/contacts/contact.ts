import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
    createContact: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            email: z.string().email(),
            officeId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    Office: {
                        connect: { id: input.officeId }
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            });
            
            if (!user.name || !user.email) {
                throw new Error('User created without required fields');
            }
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
            } as const;
        }),
}); 