// src/server/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import * as bcrypt from 'bcryptjs';
import { env } from "~/env";
import { db } from "~/server/db";
import nodemailer from "nodemailer";
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session, token, user }) => {
      // If using JWT strategy, user data comes from token
      const userId = token.sub ?? user?.id;
      
      // Fetch user roles and their permissions
      const userWithRolesAndPermissions = await db.user.findUnique({
        where: { id: userId },
        include: {
          Roles: {
            include: {
              Permissions: true,
            },
          },
        },
      });

      if (userWithRolesAndPermissions) {
        session.user.id = userId;
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
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
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
        url
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
          <html>
            <head>
              <title>Thomson Printing</title>
              <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                .header {
                    text-align: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                }
                .header img {
                    max-width: 400px;
                    height: auto;
                }
                .footer {
                    background-color: #235937;
                    color: white;
                    text-align: center;
                    padding: 40px 20px;
                    margin-top: 40px;
                }
                .footer img {
                    max-width: 300px;
                    height: auto;
                    margin-bottom: 20px;
                }
                .footer-text {
                    color: white;
                    font-size: 18px;
                    margin: 10px 0;
                }
                .footer-link {
                    color: white;
                    text-decoration: underline;
                    font-size: 18px;
                    margin: 10px 0;
                    display: block;
                }
                .footer-address {
                    color: white;
                    font-size: 16px;
                    margin: 10px 0;
                }
                .footer-copyright {
                    color: white;
                    font-size: 12px;
                    margin-top: 20px;
                    font-style: italic;
                }
                .unsubscribe {
                    font-size: 12px;
                    color: white;
                    margin-top: 20px;
                }
                .unsubscribe a {
                    color: white;
                    text-decoration: none;
                }
              </style>
            </head>
            <body>
                <div class="header">
                    <img src="https://print-portal.thomsonprinting.com/images/thomson-pdf-logo-green.svg" alt="Thomson Printing, Inc. Creative & Graphics" />
                </div>
            
                <div style="text-align: center; padding: 50px 0;">
                    <p style="font-weight: bold;"> Sign In to Thomson Printing</p>
                    <a style="display: inline-block; background: #FCA311; padding: 12px 16px; border-radius: 8px; color: black; text-decoration: none; font-weight: bold;" href='${url}'>Sign In</a>
                </div>
            
                <div class="footer">
                <img src="https://print-portal.thomsonprinting.com/images/thomson-pdf-logo-white.svg" alt="Thomson Printing, Inc. Creative & Graphics" />
                <div class="footer-text">Commercial Printing since 1905</div>
                <a href="https://thomsonprinting.com" class="footer-link">THOMSONPRINTING.COM</a>
                <div class="footer-text">636.946.3525</div>
                <div class="footer-address">601 N. Kingshighway, St. Charles MO, 63301</div>
                <div class="footer-copyright">Copyright © 2024 Thomson Printing, Inc., All rights reserved.</div>
                <div class="unsubscribe">
                    <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
                
                <p style="font-size:12px; line-height:20px;">
                  <a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" target="_blank" style="font-family:sans-serif;text-decoration:none;">
                    Unsubscribe
                  </a>
                  -
                  <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="font-family:sans-serif;text-decoration:none;">
                    Unsubscribe Preferences
                  </a>
                </p>
              </div>
                </div>
            </div>
              
            </body>
          </html>
          `,
        };
        await transporter.sendMail(mailOptions);
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          console.log('No credentials provided');
          throw new Error("Invalid credentials");
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          console.log('User not found');
          throw new Error("RegisterRequired");
        }
        // Verify the password
        const isPasswordValid = bcrypt.compareSync(credentials.password, user.password ?? '');
        if (!isPasswordValid) {
          console.log('Invalid password');
          throw new Error("Invalid password");
        }
        console.log('User found and password is valid');

        // Return the user object in the format NextAuth expects
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
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
  pages: {
    // signIn: "/auth/signin",
    // signOut: "/auth/signout",
    error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    newUser: "/users/registration",
  }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
