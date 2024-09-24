import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import querystring from 'querystring';
import { XMLParser } from 'fast-xml-parser';
import { AddressType, RoleName } from "@prisma/client";
import { api } from "~/trpc/server";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";

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

export const qbSyncCustomerRouter = createTRPCRouter({
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
});
