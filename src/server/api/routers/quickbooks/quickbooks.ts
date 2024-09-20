import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import querystring from 'querystring';
import { XMLParser } from 'fast-xml-parser';
import { AddressType, RoleName } from "@prisma/client";

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

// const parser = new XMLParser({
//     ignoreAttributes: false,
//     attributeNamePrefix: "",
//     parseAttributeValue: true
// });

async function refreshTokenIfNeeded(ctx: any) {
    const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
            quickbooksAccessToken: true,
            quickbooksRefreshToken: true,
            quickbooksTokenExpiry: true,
            quickbooksRealmId: true,
        },
    });

    if (!user?.quickbooksTokenExpiry || !user.quickbooksRefreshToken) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated with QuickBooks',
        });
    }

    const currentTime = new Date();
    const tokenExpiryTime = new Date(user.quickbooksTokenExpiry);

    // If token is expired or will expire in the next 30 minutes, refresh it
    if (tokenExpiryTime <= new Date(currentTime.getTime() + 30 * 60 * 1000)) {
        try {
            oauthClient.setToken({
                access_token: user.quickbooksAccessToken!,
                refresh_token: user.quickbooksRefreshToken,
                realmId: user.quickbooksRealmId!,
            });

            const response = await axios.post(
                'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                querystring.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: user.quickbooksRefreshToken,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                    },
                }
            );
            const tokenJson = response.data;


            // const authResponse = await oauthClient.refresh();
            // const tokenJson = authResponse.getJson();

            // Update tokens in the database
            console.log('tokenJson', tokenJson);
            await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    quickbooksAccessToken: tokenJson.access_token,
                    quickbooksRefreshToken: tokenJson.refresh_token,
                    quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                },
            });

            return tokenJson.access_token;
        } catch (error) {
            console.error('Error refreshing QuickBooks token:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to refresh QuickBooks token',
            });
        }
    }

    return user.quickbooksAccessToken;
};

async function fetchCustomers(ctx: any, accessToken: string, companyID: string, pageSize: number, lastSyncTime?: string) {
    const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';

    const parser = new XMLParser();
    let allCustomers: any[] = [];
    let startPosition = 1;
    let totalCount = 0;

    // First, get the total count of customers
    let countQuery = `SELECT COUNT(*) FROM Customer WHERE Active IN (true, false)`;
    if (lastSyncTime) {
        countQuery += ` AND Metadata.LastUpdatedTime > '${lastSyncTime}'`;
    }
    const countUrl = `${baseUrl}/v3/company/${companyID}/query?query=${encodeURIComponent(countQuery)}`;

    try {
        console.log('Fetching customer count...');
        const countResponse = await axios.get(countUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/xml',
            },
        });

        // XML response looks like this:
        // <?xml version="1.0" encoding = "UTF-8" standalone = "yes" ?>
        // <IntuitResponse xmlns="http://schema.intuit.com/finance/v3" time = "2024-09-19T15:40:54.351-07:00" >
        // <QueryResponse totalCount="29" />
        // </IntuitResponse>
        // Get the totalCount from the response

        console.log('countResponse', countResponse.data);

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
            parseAttributeValue: true
        });
        const result = parser.parse(countResponse.data);
        console.log('result', result);
        totalCount = result.IntuitResponse.QueryResponse.totalCount; // Accessing totalCount directly

        console.log('totalCount', totalCount);

    } catch (error) {
        console.error('Error fetching customer count:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch customer count from QuickBooks',
        });
    }

    // Now fetch customers with pagination
    console.log('startPosition', startPosition);
    console.log('totalCount', totalCount);
    while (startPosition <= totalCount) {
        console.log('startPosition', startPosition);
        console.log('totalCount', totalCount);
        let query = `SELECT * FROM Customer WHERE Active IN (true, false)`;
        if (lastSyncTime) {
            query += ` AND Metadata.LastUpdatedTime > '${lastSyncTime}'`;
        }

        const url = `${baseUrl}/v3/company/${companyID}/query?query=${encodeURIComponent(query)}&startPosition=${startPosition}&maxResults=${pageSize}`;

        try {
            console.log(`Fetching customers ${startPosition} to ${startPosition + pageSize - 1}...`);
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/xml',
                },
            });

            const result = parser.parse(response.data);
            const queryResponse = result.IntuitResponse.QueryResponse;

            if (queryResponse.Customer) {
                const customers = Array.isArray(queryResponse.Customer)
                    ? queryResponse.Customer
                    : [queryResponse.Customer];

                console.log(`Processing ${customers.length} customers...`);
                for (const customer of customers) {
                    await processAndSaveCustomer(ctx, customer);
                }

                allCustomers = allCustomers.concat(customers);
            }

            startPosition += pageSize;
        } catch (error) {
            console.error('Error fetching customers from QuickBooks:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch customers from QuickBooks',
            });
        }
    }

    return allCustomers;
}

async function processAndSaveCustomer(ctx: any, customer: any) {
    const {
        Id,
        DisplayName,
        CompanyName,
        GivenName,
        FamilyName,
        PrimaryEmailAddr,
        PrimaryPhone,
        BillAddr,
    } = customer;

    const companyName = CompanyName || DisplayName;
    const quickbooksId = Id.toString(); // Ensure this is a string

    // Create or update the Company
    const company = await ctx.db.company.upsert({
        where: {
            name_quickbooksId: {
                name: companyName,
                quickbooksId: quickbooksId,
            },
        },
        update: {
            name: companyName,
            quickbooksId: quickbooksId,
        },
        create: {
            name: companyName,
            quickbooksId: quickbooksId,
        },
    });

    console.log('company', company);

    // Create or update the Office
    const office = await ctx.db.office.upsert({
        where: {
            quickbooksCustomerId: quickbooksId,
        },
        update: {
            name: `QuickBooks Office - ${DisplayName}`,
            quickbooksCustomerId: quickbooksId,
        },
        create: {
            companyId: company.id,
            name: `QuickBooks Office - ${DisplayName}`,
            quickbooksCustomerId: quickbooksId,
            createdById: ctx.session.user.id,
        },
    });

    console.log('office', office);

    // Create or update the User
    const userEmail = PrimaryEmailAddr?.Address;
    console.log('userEmail', userEmail);
    if (userEmail) {
        console.log('userEmail', userEmail);
        const existingUser = await ctx.db.user.findUnique({
            where: { email: userEmail },
        });

        if (existingUser) {
            // Update existing user
            const updatedUser = await ctx.db.user.update({
                where: { id: existingUser.id },
                data: {
                    name: `${GivenName} ${FamilyName}`.trim() || DisplayName,
                    Office: { connect: { id: office.id } },
                    updatedAt: new Date(),
                },
            });
            console.log('updatedUser', updatedUser);
        } else {
            // Create new user
            const newUser = await ctx.db.user.create({
                data: {
                    email: userEmail,
                    name: `${GivenName} ${FamilyName}`.trim() || DisplayName,
                    Office: { connect: { id: office.id } },
                    Roles: {
                        connect: { name: RoleName.Customer }, // Assuming we want to assign the Customer role
                    },
                },
            });
            console.log('newUser', newUser);
            // You might want to trigger some kind of welcome email or onboarding process here
        }
    }

    // Create or update the Address
    if (BillAddr) {
        console.log('BillAddr:', BillAddr);
        // Check if an identical address already exists
        const existingAddress = await ctx.db.address.findFirst({
            where: {
                officeId: office.id,
                addressType: AddressType.Billing,
                line1: BillAddr.Line1,
                city: BillAddr.City,
                state: BillAddr.CountrySubDivisionCode,
                zipCode: String(BillAddr.PostalCode),
            }
        });

        if (existingAddress) {
            // Update the existing address
            await ctx.db.address.update({
                where: { id: existingAddress.id },
                data: {
                    line1: BillAddr.Line1,
                    line2: BillAddr.Line2 || null,
                    city: BillAddr.City,
                    state: BillAddr.CountrySubDivisionCode,
                    zipCode: String(BillAddr.PostalCode),
                    country: BillAddr.Country || "",
                    telephoneNumber: PrimaryPhone?.FreeFormNumber || "",
                    updatedAt: new Date(),
                }
            });
        } else {
            // Create a new address
            await ctx.db.address.create({
                data: {
                    officeId: office.id,
                    addressType: AddressType.Billing,
                    line1: BillAddr.Line1 || "",
                    line2: BillAddr.Line2 || null,
                    city: BillAddr.City || "",
                    state: BillAddr.CountrySubDivisionCode || "",
                    zipCode: String(BillAddr.PostalCode) || "",
                    country: BillAddr.Country || "",
                    telephoneNumber: PrimaryPhone?.FreeFormNumber || "",
                }
            });
        }
    }
}

export const quickbooksRouter = createTRPCRouter({
    initiateAuth: protectedProcedure
        .mutation(async () => {
            console.log('Initiating Quickbooks auth');
            const authUri = oauthClient.authorizeUri({
                scope: [OAuthClient.scopes.Accounting],
                state: 'intuit-test',
            });
            return { authUri };
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

    refreshToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: {
                    quickbooksAccessToken: true,
                    quickbooksRefreshToken: true,
                    quickbooksRealmId: true,
                    quickbooksTokenExpiry: true,
                },
            });

            if (!user?.quickbooksRefreshToken) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No refresh token available',
                });
            }

            const currentTime = new Date();

            try {

                oauthClient.setToken({
                    access_token: user.quickbooksAccessToken!,
                    refresh_token: user.quickbooksRefreshToken,
                    realmId: user.quickbooksRealmId!,
                    token_type: 'bearer',
                });

                // Attempt to refresh the token manually
                // Example of manually refreshing the token using curl:
                // Convert this to axios:
                // curl - X POST 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer' \
                // -H 'Accept: application/json' \
                // -H 'Content-Type: application/x-www-form-urlencoded' \
                // -H 'Authorization: REPLACE_WITH_AUTHORIZATION_HEADER (details below)'  \
                // -d 'grant_type=refresh_token' \
                // -d 'refresh_token=REPLACE_WITH_REFRESH_TOKEN'

                // Use Axios to make the request
                const response = await axios.post(
                    'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                    querystring.stringify({
                        grant_type: 'refresh_token',
                        refresh_token: user.quickbooksRefreshToken,
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
                        },
                    }
                );
                const tokenJson = response.data;

                // const authResponse = await oauthClient.refresh();
                // const tokenJson = authResponse.getJson();

                // Update tokens in the database
                await ctx.db.user.update({
                    where: { id: ctx.session.user.id },
                    data: {
                        quickbooksAccessToken: tokenJson.access_token,
                        quickbooksRefreshToken: tokenJson.refresh_token,
                        quickbooksTokenExpiry: new Date(Date.now() + tokenJson.expires_in * 1000),
                    },
                });

                return { success: true, message: 'Token refreshed successfully' };
            } catch (error) {
                console.error('Detailed error refreshing QuickBooks token:', error);

                if (error instanceof Error) {
                    console.error('Error name:', error.name);
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }

                if (error instanceof Error &&
                    (error.message.includes('invalid') || error.message.includes('expired'))) {
                    // Clear QuickBooks data if the refresh token is invalid or expired
                    await ctx.db.user.update({
                        where: { id: ctx.session.user.id },
                        data: {
                            quickbooksAccessToken: null,
                            quickbooksRefreshToken: null,
                            quickbooksTokenExpiry: null,
                            quickbooksRealmId: null,
                        },
                    });

                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'QuickBooks authorization has expired. Please reconnect your account.',
                    });
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to refresh QuickBooks token',
                    cause: error,
                });
            }
        }),

    getCompanyInfo: protectedProcedure
        .query(async ({ ctx }) => {
            const accessToken = await refreshTokenIfNeeded(ctx);

            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksRealmId: true },
            });

            if (!user?.quickbooksRealmId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated with QuickBooks',
                });
            }

            oauthClient.setToken({
                access_token: accessToken,
                realmId: user.quickbooksRealmId,
            });

            const companyID = user.quickbooksRealmId;
            const url = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox' ?
                OAuthClient.environment.sandbox :
                OAuthClient.environment.production;

            try {
                const response = await oauthClient.makeApiCall({
                    url: `${url}v3/company/${companyID}/companyinfo/${companyID}`
                });

                // Return only the necessary data
                return {
                    companyInfo: response.json.CompanyInfo,
                    time: response.json.time
                };
            } catch (error) {
                console.error('Error getting company info:', error);
                if (error instanceof Error) {
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                }
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to get company info from QuickBooks',
                    cause: error
                });
            }
        }),

    getCustomers: protectedProcedure
        .input(z.object({
            lastSyncTime: z.string().optional(),
            pageSize: z.number().min(1).max(1000).default(100),
        }))
        .query(async ({ ctx, input }) => {
            console.log('Starting customer sync...');
            const accessToken = await refreshTokenIfNeeded(ctx);
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksRealmId: true },
            });

            if (!user?.quickbooksRealmId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated with QuickBooks',
                });
            }

            console.log('Fetching and processing customers...');
            const lastSyncTime = input.lastSyncTime ? new Date(input.lastSyncTime).toISOString() : undefined;
            const customers = await fetchCustomers(ctx, accessToken, user.quickbooksRealmId, input.pageSize, lastSyncTime);
            console.log(`Sync complete. Total customers processed: ${customers.length}`);
            return {
                totalCustomers: customers.length,
                message: `Successfully synced ${customers.length} customers from QuickBooks.`,
            };
        }),

    checkQuickbooksAuthStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksAccessToken: true, quickbooksTokenExpiry: true },
            });

            return {
                isAuthenticated: !!user?.quickbooksAccessToken && new Date() < user.quickbooksTokenExpiry!,
            };
        }),
});