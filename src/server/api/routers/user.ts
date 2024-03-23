import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

// Get a User by ID
// Get the User's Roles and Permissions
export const userRouter = createTRPCRouter({
    getByID: publicProcedure.input(z.string()).query(({ ctx, input }) => {
        return ctx.db.user.findUnique({
            where: {
                id: input,
            },
            include: {
                roles: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
    }),
    // Return Users and include their Roles and Permissions
    // This is a more complex query that requires joining multiple tables
    // Users has a many-to-many relationship with Roles
    // Roles has a many-to-many relationship with Permissions through Roles
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.db.user.findMany({
            include: {
                roles: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
    })
})
