import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL"
      ),
    // DIRECT_DATABASE_URL: z
    //   .string()
    //   .url()
    //   .refine(
    //     (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
    //     "You forgot to change the default URL"
    //   ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    PUBLIC_BASE_URL: z.string(),
    OPENAI_API_KEY: z.string(),
    QUICKBOOKS_CLIENT_ID: z.string(),
    QUICKBOOKS_CLIENT_SECRET: z.string(),
    QUICKBOOKS_ENVIRONMENT: z.enum(["sandbox", "production"]),
    SENDGRID_ADMIN_EMAIL: z.string().email(),
    SENDGRID_SMTP_USER: z.string(),
    SENDGRID_SMTP_PASSWORD: z.string(),
    SENDGRID_SMTP_HOST: z.string(),
    SENDGRID_SMTP_PORT: z.string(),
    SENDGRID_EMAIL_FROM: z.string().email(),
    WEBSITE_URL: z.string(),
    HONEYBADGER_API_KEY: z.string(),
    HONEYBADGER_ENV: z.string().default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
  */
 client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_BASE_URL: z.string(),
    NEXT_PUBLIC_OPENAI_API_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
    NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID: z.string(),
    NEXT_PUBLIC_QUICKBOOKS_CLIENT_SECRET: z.string(),
    NEXT_PUBLIC_QUICKBOOKS_ENVIRONMENT: z.string(),
    NEXT_PUBLIC_HONEYBADGER_API_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID: process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID,
    NEXT_PUBLIC_QUICKBOOKS_CLIENT_SECRET: process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_SECRET,
    NEXT_PUBLIC_QUICKBOOKS_ENVIRONMENT: process.env.NEXT_PUBLIC_QUICKBOOKS_ENVIRONMENT,
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
    QUICKBOOKS_CLIENT_ID: process.env.QUICKBOOKS_CLIENT_ID,
    QUICKBOOKS_CLIENT_SECRET: process.env.QUICKBOOKS_CLIENT_SECRET,
    QUICKBOOKS_ENVIRONMENT: process.env.QUICKBOOKS_ENVIRONMENT,
    SENDGRID_ADMIN_EMAIL: process.env.SENDGRID_ADMIN_EMAIL,
    SENDGRID_SMTP_USER: process.env.SENDGRID_SMTP_USER,
    SENDGRID_SMTP_PASSWORD: process.env.SENDGRID_SMTP_PASSWORD,
    SENDGRID_SMTP_HOST: process.env.SENDGRID_SMTP_HOST,
    SENDGRID_SMTP_PORT: process.env.SENDGRID_SMTP_PORT,
    SENDGRID_EMAIL_FROM: process.env.SENDGRID_EMAIL_FROM,
    WEBSITE_URL: process.env.WEBSITE_URL,
    HONEYBADGER_API_KEY: process.env.HONEYBADGER_API_KEY,
    HONEYBADGER_ENV: process.env.HONEYBADGER_ENV,
    NEXT_PUBLIC_HONEYBADGER_API_KEY: process.env.NEXT_PUBLIC_HONEYBADGER_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
