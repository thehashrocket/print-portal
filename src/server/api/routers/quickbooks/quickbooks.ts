import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { getServerAuthSession } from "~/server/auth";


const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: 'sandbox', // or 'production'
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI!,
});

export const quickbooksRouter = createTRPCRouter({
    checkAuthStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const session = await getServerAuthSession();
            return {
                isAuthenticated: !!session?.user,
            };
        }),

    getAuthUrl: protectedProcedure
        .mutation(async () => {
            const authUri = oauthClient.authorizeUri({
                scope: [OAuthClient.scopes.Accounting],
                state: 'testState',
            });
            return { authUri };
        }),

    saveTokens: protectedProcedure
        .input(z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            expiresIn: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            // TODO: Implement token saving logic
            // This might involve storing the tokens in your database
            console.log('Tokens received:', input);
            return { success: true };
        }),
});