// ~/src/server/api/routers/userManagement.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { RoleName } from "@prisma/client";

export const userManagementRouter = createTRPCRouter({
    getAllUsers: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.user.findMany({
                include: {
                    Roles: true,
                },
            });
        }),

    updateUserRoles: protectedProcedure
        .input(z.object({
            userId: z.string(),
            roleNames: z.array(z.nativeEnum(RoleName)),
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, roleNames } = input;

            // First, remove all existing roles
            await ctx.db.user.update({
                where: { id: userId },
                data: {
                    Roles: {
                        set: [],
                    },
                },
            });

            // Then, add the new roles
            return ctx.db.user.update({
                where: { id: userId },
                data: {
                    Roles: {
                        connect: roleNames.map(name => ({ name })),
                    },
                },
                include: {
                    Roles: true,
                },
            });
        }),
});