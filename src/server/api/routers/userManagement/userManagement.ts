// ~/src/server/api/routers/userManagement.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc";
import { RoleName } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userManagementRouter = createTRPCRouter({
    getAllUsers: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.user.findMany({
                where: {
                    deleted: false,
                },
                include: {
                    Roles: true,
                },
            });
        }),

    getUserById: protectedProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
          return ctx.db.user.findUnique({
            where: {
              id: input,
            },
            include: {
              Roles: true,
              offices: {
                include: {
                  office: {
                    include: {
                      Company: true,
                    },
                  },
                },
              },
            },
          });
        }), 

    deleteUser: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: input },
                data: { deleted: true },
            });
        }),

    updateUser: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            roleIds: z.array(z.string()),
            officeIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            // Delete existing office assignments
            await ctx.db.usersOnOffices.deleteMany({
                where: {
                    userId: input.id,
                },
            });

            return ctx.db.user.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    email: input.email,
                    Roles: {
                        set: input.roleIds.map(id => ({ id })),
                    },
                    offices: {
                        create: input.officeIds.map(officeId => ({
                            office: {
                                connect: { id: officeId }
                            }
                        }))
                    },
                },
                include: {
                    Roles: true,
                    offices: {
                        include: {
                            office: {
                                include: {
                                    Company: true,
                                },
                            },
                        },
                    },
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

    createUser: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string().email(),
            companyId: z.string(),
            officeId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user already exists
            const existingUser = await ctx.db.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'User with this email already exists',
                });
            }

            // Create the user
            const user = await ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    offices: {
                        create: {
                            office: {
                                connect: { id: input.officeId }
                            }
                        }
                    },
                },
            });

            return user;
        }),
});