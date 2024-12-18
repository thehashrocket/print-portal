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
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: {
                    id: input
                },
                include: {
                    Roles: true,
                    Office: {
                        include: {
                            Company: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            return user;
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
            email: z.string().email(),
            officeId: z.string().optional(),
            roleIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, roleIds, ...updateData } = input;

            // Check if the user has permission to update
            const isOwnProfile = ctx.session.user.id === id;
            const isAdmin = ctx.session.user.Roles.includes("Admin");
            const hasEditPermission = isAdmin || ctx.session.user.Permissions.some((p: string) =>
                ["user_create", "user_update", "user_edit"].includes(p)
            );

            if (!isOwnProfile && !hasEditPermission) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to update this user",
                });
            }

            // If not an admin or doesn't have edit permission, remove office and role updates
            if (!hasEditPermission) {
                delete updateData.officeId;
            }

            const updatedUser = await ctx.db.user.update({
                where: { id },
                data: {
                    ...updateData,
                    ...(hasEditPermission && {
                        Roles: {
                            set: roleIds.map(id => ({ id })),
                        },
                    }),
                },
                include: {
                    Roles: true,
                    Office: {
                        include: {
                            Company: true,
                        },
                    },
                },
            });

            return updatedUser;
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
                    officeId: input.officeId,
                },
            });

            return user;
        }),
});