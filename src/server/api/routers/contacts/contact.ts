import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const contactRouter = createTRPCRouter({
    createContact: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string().email(),
            officeId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // Find or create user by email
            const user = await ctx.db.user.upsert({
                where: { email: input.email },
                update: { 
                    name: input.name,
                },
                create: {
                    email: input.email,
                    name: input.name,
                },
            });

            // Check if the user is already connected to this office
            const existingOfficeConnection = await ctx.db.usersOnOffices.findFirst({
                where: {
                    userId: user.id,
                    officeId: input.officeId,
                },
            });

            // If not connected to the office, create the connection
            if (!existingOfficeConnection) {
                await ctx.db.usersOnOffices.create({
                    data: {
                        userId: user.id,
                        officeId: input.officeId,
                    },
                });
            }

            return user;
        }),

    getByOfficeId: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const contacts = await ctx.db.user.findMany({
                where: {
                    offices: {
                        some: {
                            officeId: input
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: {
                    name: 'asc',
                },
            });

            return contacts;
        }),
}); 