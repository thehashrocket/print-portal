import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as bcrypt from 'bcryptjs';

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
      where: {
        deleted: false,
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

  // Create a new user using the email and password
  // Downcase the email before creating the user
  create: publicProcedure.input(z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })).mutation(async ({ ctx, input }) => {
    const downcasedEmail = input.email.toLowerCase();
    // Search for the user by email (case insensitive)
    const user = await ctx.db.user.findFirst({
      where: {
        email: {
          mode: 'insensitive',
          equals: input.email,
        },
      },
    });
    // If the user exists, return an error
    if (user) {
      throw new Error('User already exists');
    }
    // Hash the password
    const hashedPassword = bcrypt.hashSync(input.password, 10);
    return ctx.db.user.create({
      data: {
        email: downcasedEmail,
        password: hashedPassword,
      },
    });
  }),

  // Get Users by Office ID
  getByOfficeId: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findMany({
      where: {
        deleted: false,
        offices: {
          some: {
            officeId: input
          }
        }
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
