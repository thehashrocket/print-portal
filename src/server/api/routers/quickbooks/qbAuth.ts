import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import querystring from 'querystring';

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

export const qbAuthRouter = createTRPCRouter({

    checkQuickbooksAuthStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksAccessToken: true, quickbooksTokenExpiry: true },
            });
            console.log('User:', user);
            // Check if the token is expired
            const isTokenExpired = user?.quickbooksTokenExpiry && new Date() > user.quickbooksTokenExpiry;
            // If the token is expired, set quickbooksAccessToken, quickbooksRealmId, quickbooksRefreshToken, and quickbooksTokenExpiry to null
            if (isTokenExpired) {
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: null,
                        quickbooksRealmId: null,
                        quickbooksRefreshToken: null,
                        quickbooksTokenExpiry: null,
                        updatedAt: new Date(),
                    }
                });
            }
            console.log('User after update:', user);
            return {
                isAuthenticated: !!user?.quickbooksAccessToken && new Date() < user.quickbooksTokenExpiry!,
            };
        }),

    getAccessToken: protectedProcedure
        .input(z.object({ code: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { code } = input;
            const { user } = ctx.session;

            try {
                const accessTokenResponse = await oauthClient.getAccessToken(code);
                const accessToken = accessTokenResponse.access_token;
                const refreshToken = accessTokenResponse.refresh_token;
                const expiresIn = accessTokenResponse.expires_in;
                const realmId = accessTokenResponse.realmId;

                await ctx.db.user.update({
                    where: { id: user.id },
                    data: {
                        quickbooksAccessToken: accessToken,
                        quickbooksRefreshToken: refreshToken,
                        quickbooksTokenExpiry: new Date(Date.now() + expiresIn * 1000),
                        quickbooksRealmId: realmId,
                        updatedAt: new Date(),
                    }
                });
                console.log('User authenticated with QuickBooks');
                return { success: true, message: 'User authenticated with QuickBooks' };
            } catch (error) {
                console.error('Error authenticating user with QuickBooks:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to authenticate user with QuickBooks'
                });
            }
        }),

    getUserInfo: protectedProcedure
        .mutation(async ({ ctx }) => {
            const { user } = ctx.session;

            try {
                const userInfoResponse = await oauthClient.getUserInfo(user.quickbooksAccessToken);
                return { success: true, message: 'User info retrieved', userInfo: userInfoResponse };
            } catch (error) {
                console.error('Error retrieving user info:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to retrieve user info'
                });
            }
        }),

    handleCallback: protectedProcedure
        .input(z.object({
            code: z.string(),
            realmId: z.string(),
            state: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const tokenEndpoint = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                    ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
                    : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

                const data = querystring.stringify({
                    grant_type: 'authorization_code',
                    code: input.code,
                    redirect_uri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
                });

                const config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                    },
                };

                const response = await axios.post(tokenEndpoint, data, config);
                const tokenJson = response.data;

                // Save tokens to your database here
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: tokenJson.access_token,
                        quickbooksRefreshToken: tokenJson.refresh_token,
                        quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                        quickbooksRealmId: input.realmId,
                        updatedAt: new Date(),
                    },
                });

                return { success: true };
            } catch (error) {
                console.error('Error handling Quickbooks callback:', error);
                if (axios.isAxiosError(error)) {
                    console.error('Response data:', error.response?.data);
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to authenticate with Quickbooks',
                });
            }
        }),

    initializeAuth: protectedProcedure
        .mutation(async ({ ctx }) => {
            console.log('Initializing QuickBooks auth');
            console.log('QUICKBOOKS_CLIENT_ID:', process.env.QUICKBOOKS_CLIENT_ID);
            console.log('QUICKBOOKS_CLIENT_SECRET:', process.env.QUICKBOOKS_CLIENT_SECRET ? '[REDACTED]' : 'Not set');
            console.log('QUICKBOOKS_ENVIRONMENT:', process.env.QUICKBOOKS_ENVIRONMENT);
            console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

            const redirectUri = `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`;
            console.log('Redirect URI:', redirectUri);

            const oauthClient = new OAuthClient({
                clientId: process.env.QUICKBOOKS_CLIENT_ID,
                clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
                environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
                redirectUri: redirectUri,
            });

            const authUri = oauthClient.authorizeUri({
                scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
                state: 'teststate', // Consider generating a unique state for each request
            });

            console.log('Generated authorization URL:', authUri);

            return { authorizationUrl: authUri };
        }),

    refreshToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const { user } = ctx.session;

            try {
                const refreshTokenResponse = await oauthClient.refreshToken(user.quickbooksRefreshToken);
                const accessToken = refreshTokenResponse.access_token;
                const expiresIn = refreshTokenResponse.expires_in;

                await ctx.db.user.update({
                    where: { id: user.id },
                    data: {
                        quickbooksAccessToken: accessToken,
                        quickbooksTokenExpiry: new Date(Date.now() + expiresIn * 1000),
                    }
                });

                return { success: true, message: 'Token refreshed' };
            } catch (error) {
                console.error('Error refreshing token:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to refresh token'
                });
            }
        }),

    revokeToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const { user } = ctx.session;

            try {
                await oauthClient.revokeToken(user.quickbooksAccessToken);

                await ctx.db.user.update({
                    where: { id: user.id },
                    data: {
                        quickbooksAccessToken: null,
                        quickbooksRefreshToken: null,
                        quickbooksTokenExpiry: null,
                        quickbooksRealmId: null,
                        updatedAt: new Date(),
                    }
                });

                return { success: true, message: 'Token revoked' };
            } catch (error) {
                console.error('Error revoking token:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to revoke token'
                });
            }
        }),


});
