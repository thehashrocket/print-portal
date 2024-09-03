// src/server/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

import { env } from "~/env";
import { db } from "~/server/db";
import nodemailer from "nodemailer";
import { getVerificationEmailTemplate } from "~/utils/emailTemplates";
import { sendAdminNotification } from "~/utils/notifications";

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
          Roles: {
            include: {
              Permissions: true, // Include permissions for each role
            },
          },
        },
      });

      if (userWithRolesAndPermissions) {
        session.user.id = user.id;
        // Map roles to their names
        session.user.Roles = userWithRolesAndPermissions.Roles.map(
          (role) => role.name,
        );

        // Collect and de-duplicate permissions across all roles
        const permissionsSet = new Set();
        userWithRolesAndPermissions.Roles.forEach((role) => {
          role.Permissions.forEach((permission) => {
            permissionsSet.add(permission.name);
          });
        });

        session.user.Permissions = Array.from(permissionsSet);
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
    EmailProvider({
      server: {
        host: process.env.SENDGRID_SMTP_HOST,
        port: parseInt(process.env.SENDGRID_SMTP_PORT ?? "465"),
        auth: {
          user: process.env.SENDGRID_SMTP_USER,
          pass: process.env.SENDGRID_SMTP_PASSWORD,
        },
      },
      from: process.env.SENDGRID_EMAIL_FROM,
      sendVerificationRequest: async ({
        identifier: email,
        url,
        token,
        provider,
      }) => {
        // Check if the user exists in the database
        const existingUser = await db.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          // If the user doesn't exist, send a notification to the admin
          await sendAdminNotification(`New user sign-in attempt: ${email}`);
        }
        const transporter = nodemailer.createTransport({
          host: process.env.SENDGRID_SMTP_HOST,
          port: parseInt(process.env.SENDGRID_SMTP_PORT ?? "465"),
          secure: true, // use SSL
          auth: {
            user: process.env.SENDGRID_SMTP_USER,
            pass: process.env.SENDGRID_SMTP_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.SENDGRID_EMAIL_FROM,
          to: email,
          subject: "Verification email",
          text: `[Your Subject]`,
          html: `
          <div style="text-align: center; padding: 50px 0;">
            <p style="font-weight: bold;"> Sign In to [Your Website]</p>
            <a style="display: inline-block; background: #FCA311; padding: 12px 16px; border-radius: 8px; color: black; text-decoration: none; font-weight: bold;" href='${url}'>Sign In</a>
          </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      },
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
