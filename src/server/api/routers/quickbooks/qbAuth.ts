import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import querystring from 'querystring';
import crypto from 'crypto';
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

    getIntuitSignInUrl: protectedProcedure
        .mutation(async ({ ctx }) => {
            console.log('Getting Intuit sign-in URL');

            // https://appcenter.intuit.com/connect/oauth2?
            // client_id = <Client ID from developer portal >&
            // response_type=code &
            // redirect_uri=<redirect URI for your app >&
            // scope= com.intuit.quickbooks.accounting &
            // state= security_token % 3D138r5719ru3e1

            // Generate a URI with the above parameters
            const redirectUri = `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`;
            const state = crypto.randomBytes(16).toString('hex');
            const clientId = process.env.QUICKBOOKS_CLIENT_ID;
            const scope = 'com.intuit.quickbooks.accounting';

            const authUri = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

            console.log('Generated Intuit sign-in URL:', authUri);

            return { signInUrl: authUri };
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

                console.log('Token JSON:', tokenJson);

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
                state: crypto.randomBytes(16).toString('hex'), // Consider generating a unique state for each request
            });

            console.log('Generated authorization URL:', authUri);

            return { authorizationUrl: authUri };
        }),

    refreshToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { 
                    quickbooksAccessToken: true, 
                    quickbooksRefreshToken: true, 
                    quickbooksTokenExpiry: true 
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'User not found'
                });
            }
            let refreshToken = '';
            let accessToken = '';
            let expiresIn = 0;

            try {
                oauthClient
                .refreshUsingToken(user.quickbooksRefreshToken)
                .then(async function (authResponse: { json: any; }) {
                    refreshToken = authResponse.json.refresh_token;
                    accessToken = authResponse.json.access_token;
                    expiresIn = authResponse.json.expires_in;
                    await ctx.db.user.update({
                        where: { id: ctx.session.user.id },
                        data: {
                            quickbooksAccessToken: accessToken,
                            quickbooksRefreshToken: refreshToken,
                            quickbooksTokenExpiry: new Date(Date.now() + expiresIn * 1000),
                        },
                    });
                })
                .catch(function (e: { originalMessage: string; intuit_tid: any; }) {
                    console.error('THE ERROR MESSAGE IS :' + e.originalMessage);
                    console.error(e.intuit_tid);
                });

                return { success: true, message: 'Access token refreshed' };
            } catch (error) {
                console.error('Error refreshing access token:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to refresh access token'
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
