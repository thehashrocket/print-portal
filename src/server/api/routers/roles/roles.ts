// ~/src/server/api/routers/roles.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { throwForbidden } from "~/server/api/errors";

export const rolesRouter = createTRPCRouter({
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            // Check if the user has permission to view all roles
            const canViewRoles = ctx.session.user.Roles.includes("Admin") ||
                ctx.session.user.Permissions.includes("role_read");

            if (!canViewRoles) {
                throwForbidden("You don't have permission to view all roles");
            }

            return ctx.db.role.findMany();
        }),

    // Add other role-related procedures as needed
});