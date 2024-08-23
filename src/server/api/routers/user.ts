import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

// Get a User by ID
// Get the User's Roles and Permissions
export const userRouter = createTRPCRouter({
  getByID: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: {
        id: input,
      },
      include: {
        Roles: {
          include: {
            Permissions: true,
          },
        },
      },
    });
  }),
  // Return Users and include their Roles and Permissions
  // This is a more complex query that requires joining multiple tables
  // Users has a many-to-many relationship with Roles
  // Roles has a many-to-many relationship with Permissions through Roles
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      include: {
        Roles: {
          include: {
            Permissions: true,
          },
        },
      },
    });
  }),
  getByOfficeId: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findMany({
      where: {
        officeId: input,
      },
      include: {
        Roles: {
          include: {
            Permissions: true,
          },
        },
      },
    });
  }),
});
