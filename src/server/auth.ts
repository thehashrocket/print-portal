import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from 'next-auth/providers/google';

import { env } from "~/env";
import { db } from "~/server/db";

// We're augmenting the Session type to include user roles and permissions in the session object.
// We're defining the user object to have an id, roles, and permissions.
// We're declaring the type in a module declaration file so that TypeScript knows about the new properties.
// This is located in src/types/next-auth.d.ts.

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      // Fetch user roles and their permissions
      const userWithRolesAndPermissions = await db.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              permissions: true, // Include permissions for each role
            },
          },
        },
      });

      if (userWithRolesAndPermissions) {
        session.user.id = user.id;
        // Map roles to their names
        session.user.roles = userWithRolesAndPermissions.roles.map(role => role.name);

        // Collect and de-duplicate permissions across all roles
        const permissionsSet = new Set();
        userWithRolesAndPermissions.roles.forEach(role => {
          role.permissions.forEach(permission => {
            permissionsSet.add(permission.name);
          });
        });

        session.user.permissions = Array.from(permissionsSet);
      }

      return session;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
