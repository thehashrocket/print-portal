import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { AddressType, RoleName } from "@prisma/client";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import stringSimilarity from 'string-similarity';

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

async function handleAddress(ctx: any, officeId: string, addr: any, type: AddressType, phone: string | undefined) {
    const addressData = {
        officeId,
        addressType: type,
        line1: addr.Line1 || "",
        line2: addr.Line2 || null,
        city: addr.City || "",
        state: addr.CountrySubDivisionCode || "",
        zipCode: String(addr.PostalCode) || "",
        country: addr.Country || "",
        telephoneNumber: phone || "",
        quickbooksId: addr.Id.toString(),
    };

    // Try to find an existing address
    let existingAddress = await ctx.db.address.findFirst({
        where: {
            officeId,
            addressType: type,
            quickbooksId: addr.Id.toString(),
        },
    });

    if (existingAddress) {
        // Update existing address
        await ctx.db.address.update({
            where: { id: existingAddress.id },
            data: addressData,
        });
    } else {
        // Create new address
        await ctx.db.address.create({
            data: addressData,
        });
    }
}

async function handleUser(ctx: any, email: string, firstName: string, lastName: string, displayName: string, officeId: string) {
    const userData = {
        name: `${firstName} ${lastName}`.trim() || displayName,
        officeId,
    };

    await ctx.db.user.upsert({
        where: { email },
        update: userData,
        create: {
            ...userData,
            email,
            Roles: { connect: { name: 'Customer' } },
        },
    });
}

async function processAndSaveCustomer(ctx: any, customer: any) {

    const {
        Id: quickbooksId,
        FullyQualifiedName,
        CompanyName,
        DisplayName,
        BillAddr,
        ShipAddr,
        PrimaryPhone,
        PrimaryEmailAddr,
        GivenName,
        FamilyName,
        SyncToken
    } = customer;


    const isSubLocation = FullyQualifiedName.includes(':');
    let companyName, officeName;

    if (isSubLocation) {
        [companyName, officeName] = FullyQualifiedName.split(':').map((s: string) => s.trim());
    } else {
        companyName = FullyQualifiedName;
        officeName = DisplayName;
    }

    // Find or create the Company
    let company = await ctx.db.company.findFirst({ where: { name: companyName } });

    if (!isSubLocation) {
        // Find by company name or QuickbooksId
        company = await ctx.db.company.findFirst({
            where: {
                OR: [
                    { name: companyName },
                    { quickbooksId: String(quickbooksId) }
                ]
            }
        });
        // If no company was found, create a new one
        if (!company) {
            company = await ctx.db.company.create({
                data: {
                    name: companyName,
                    quickbooksId: String(quickbooksId),
                    syncToken: String(SyncToken),
                }
            });
        } else {
            // Update the company's syncToken
            await ctx.db.company.update({
                where: { id: company.id },
                data: {
                    name: companyName,
                    syncToken: String(SyncToken),
                    quickbooksId: String(quickbooksId),
                }
            });
        }
    }

    // Create or update the Office
    const office = await ctx.db.office.upsert({
        where: { quickbooksCustomerId: String(quickbooksId) },
        update: {
            name: officeName,
            companyId: company.id,
            syncToken: String(SyncToken),
        },
        create: {
            name: officeName,
            companyId: company.id,
            quickbooksCustomerId: String(quickbooksId),
            createdById: ctx.session.user.id,
            syncToken: String(SyncToken),
        },
    });

    // Handle Billing Address
    if (BillAddr) {
        await handleAddress(ctx, office.id, BillAddr, AddressType.Billing, PrimaryPhone?.FreeFormNumber);
    }

    // Handle Shipping Address
    if (ShipAddr && JSON.stringify(ShipAddr) !== JSON.stringify(BillAddr)) {
        await handleAddress(ctx, office.id, ShipAddr, AddressType.Shipping, PrimaryPhone?.FreeFormNumber);
    }

    // Handle User
    if (PrimaryEmailAddr?.Address) {
        await handleUser(ctx, PrimaryEmailAddr.Address, GivenName, FamilyName, DisplayName, office.id);
    }

    return office;
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
