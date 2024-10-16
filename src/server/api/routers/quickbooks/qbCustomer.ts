import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import { z } from 'zod';
import { $Enums, PrismaClient } from '@prisma/client';
import axios from 'axios';
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ISODateString } from "next-auth";

function sanitizeString(str: string): string {
    // Remove or replace invalid characters
    return str.replace(/[^\w\s-]/gi, '').trim();
}

async function pullFromQuickBooks(ctx: { session: { user: any; expires: ISODateString; }; headers: Headers; db: PrismaClient<{ log: ("query" | "warn" | "error")[]; }, never, DefaultArgs>; }, realmId: string, office: { Company: { quickbooksId: string | null; id: string; createdAt: Date; updatedAt: Date; name: string; syncToken: string | null; }; Addresses: { quickbooksId: string | null; city: string; country: string; line1: string; line2: string | null; officeId: string; telephoneNumber: string; zipCode: string; state: string; addressType: $Enums.AddressType; id: string; createdAt: Date; updatedAt: Date; }[]; } & { companyId: string; id: string; createdAt: Date; updatedAt: Date; name: string; syncToken: string | null; createdById: string; fullyQualifiedName: string | null; quickbooksCustomerId: string | null; }, accessToken: any) {
    try {
        const response = await axios.get(
            `https://quickbooks.api.intuit.com/v3/company/${realmId}/customer/${office.quickbooksCustomerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        const qbCustomer = response.data.Customer;
        return await updateOfficeWithQuickBooksData(ctx, office, qbCustomer);
    } catch (error) {
        console.error('Error pulling data from QuickBooks:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to pull data from QuickBooks',
        });
    }
}

type Context = {
    session: { user: any; expires: ISODateString; };
    headers: Headers;
    db: PrismaClient<{ log: ("query" | "warn" | "error")[]; }, never, DefaultArgs>;
};

type Office = {
    Company: {
        quickbooksId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        syncToken: string | null;
    };
    Addresses: {
        quickbooksId: string | null;
        city: string;
        country: string;
        line1: string;
        line2: string | null;
        officeId: string;
        telephoneNumber: string;
        zipCode: string;
        state: string;
        addressType: $Enums.AddressType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    syncToken: string | null;
    createdById: string;
    fullyQualifiedName: string | null;
    quickbooksCustomerId: string | null;
};

type QbCustomer = {
    CompanyName: string;
    Id: any;
    SyncToken: any;
    BillAddr: {
        Line1: any;
        City: any;
        CountrySubDivisionCode: any;
        PostalCode: any;
        Country: any;
    };
    PrimaryPhone: { FreeFormNumber: any; };
}

async function findMatchingCustomerInQuickBooks(
    realmId: string,
    office: Office,
    accessToken: any
) {
    try {
        const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                ? 'https://sandbox-quickbooks.api.intuit.com'
                : 'https://quickbooks.api.intuit.com';

        const response = await axios.get(
            `${baseUrl}/v3/company/${realmId}/query?query=select * from Customer where DisplayName = '${office.Company.name}:${office.name}' or CompanyName = '${office.Company.name}'`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                },
            }
        );

        const customers = response.data.QueryResponse.Customer;
        return customers && customers.length > 0 ? customers[0] : null;
    } catch (error) {
        console.error('Error searching for customer in QuickBooks:', error);
        return null;
    }
}

async function updateOfficeWithQuickBooksData(
    ctx: Context,
    office: Office,
    qbCustomer: QbCustomer
) {
    const companyName = qbCustomer.CompanyName.split(':')[0];
    const officeName = qbCustomer.CompanyName.includes(':') ? qbCustomer.CompanyName.split(':')[1] : office.name;

    const updatedCompany = await ctx.db.company.update({
        where: { id: office.Company.id },
        data: {
            name: companyName,
            quickbooksId: qbCustomer.Id,
            syncToken: qbCustomer.SyncToken,
        },
    });

    const updatedOffice = await ctx.db.office.update({
        where: { id: office.id },
        data: {
            name: officeName,
            quickbooksCustomerId: qbCustomer.Id,
            Addresses: {
                upsert: {
                    where: { id: office.Addresses[0]?.id || 'new' },
                    create: {
                        line1: qbCustomer.BillAddr.Line1,
                        city: qbCustomer.BillAddr.City,
                        state: qbCustomer.BillAddr.CountrySubDivisionCode,
                        zipCode: qbCustomer.BillAddr.PostalCode,
                        country: qbCustomer.BillAddr.Country,
                        addressType: 'Billing',
                        telephoneNumber: qbCustomer.PrimaryPhone?.FreeFormNumber || '',
                    },
                    update: {
                        line1: qbCustomer.BillAddr.Line1,
                        city: qbCustomer.BillAddr.City,
                        state: qbCustomer.BillAddr.CountrySubDivisionCode,
                        zipCode: qbCustomer.BillAddr.PostalCode,
                        country: qbCustomer.BillAddr.Country,
                        telephoneNumber: qbCustomer.PrimaryPhone?.FreeFormNumber || '',
                    },
                },
            },
        },
    });

    return { company: updatedCompany, office: updatedOffice };
}

async function pushToQuickBooks(ctx: { session: { user: any; expires: ISODateString; }; headers: Headers; db: PrismaClient<{ log: ("query" | "warn" | "error")[]; }, never, DefaultArgs>; }, realmId: string, office: { Company: { quickbooksId: string | null; id: string; createdAt: Date; updatedAt: Date; name: string; syncToken: string | null; }; Addresses: { quickbooksId: string | null; city: string; country: string; line1: string; line2: string | null; officeId: string; telephoneNumber: string; zipCode: string; state: string; addressType: $Enums.AddressType; id: string; createdAt: Date; updatedAt: Date; }[]; } & { companyId: string; id: string; createdAt: Date; updatedAt: Date; name: string; syncToken: string | null; createdById: string; fullyQualifiedName: string | null; quickbooksCustomerId: string | null; }, accessToken: any) {
    const qbCustomerData = {
        DisplayName: `${office.Company.name}:${office.name}`,
        CompanyName: `${office.Company.name}:${office.name}`,
        BillAddr: {
            Line1: office.Addresses[0]?.line1 || '',
            City: office.Addresses[0]?.city || '',
            Country: office.Addresses[0]?.country || '',
            CountrySubDivisionCode: office.Addresses[0]?.state || '',
            PostalCode: office.Addresses[0]?.zipCode || '',
        },
        PrimaryPhone: { FreeFormNumber: office.Addresses[0]?.telephoneNumber || '' },
    };

    try {
        const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                ? 'https://sandbox-quickbooks.api.intuit.com'
                : 'https://quickbooks.api.intuit.com';

        const response = await axios.post(
            `${baseUrl}/v3/company/${realmId}/customer`,
            qbCustomerData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const createdQbCustomer = response.data.Customer;
        return await updateOfficeWithQuickBooksData(ctx, office, createdQbCustomer);
    } catch (error) {
        console.error('Error pushing data to QuickBooks:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to push data to QuickBooks',
        });
    }
}

export const qbCustomerRouter = createTRPCRouter({
    createCustomer: protectedProcedure
        .input(z.object({
            companyName: z.string(),
            officeName: z.string(),
            billAddr: z.object({
                line1: z.string(),
                city: z.string(),
                country: z.string(),
                countrySubDivisionCode: z.string(),
                postalCode: z.string(),
            }),
            notes: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
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

            const qbCustomerData = {
                DisplayName: input.companyName,
                CompanyName: input.companyName,
                BillAddr: {
                    Line1: input.billAddr.line1,
                    City: input.billAddr.city,
                    Country: input.billAddr.country,
                    CountrySubDivisionCode: input.billAddr.countrySubDivisionCode,
                    PostalCode: input.billAddr.postalCode,
                },
                Notes: input.notes,
                PrimaryPhone: input.phone ? { FreeFormNumber: input.phone } : undefined,
                PrimaryEmailAddr: input.email ? { Address: input.email } : undefined,
            };

            try {
                const response = await axios.post(
                    `https://quickbooks.api.intuit.com/v3/company/${user.quickbooksRealmId}/customer`,
                    qbCustomerData,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const qbCustomer = response.data.Customer;

                // Create or update Company in our database
                const company = await ctx.db.company.upsert({
                    where: { quickbooksId: qbCustomer.Id },
                    update: {
                        name: qbCustomer.CompanyName,
                        quickbooksId: qbCustomer.Id,
                        syncToken: qbCustomer.SyncToken,
                    },
                    create: {
                        name: qbCustomer.CompanyName,
                        quickbooksId: qbCustomer.Id,
                        syncToken: qbCustomer.SyncToken,
                    },
                });

                // Create Office
                const office = await ctx.db.office.create({
                    data: {
                        companyId: company.id,
                        name: input.officeName,
                        quickbooksCustomerId: qbCustomer.Id,
                        createdById: ctx.session.user.id,
                        Addresses: {
                            create: {
                                line1: qbCustomer.BillAddr.Line1,
                                city: qbCustomer.BillAddr.City,
                                state: qbCustomer.BillAddr.CountrySubDivisionCode,
                                zipCode: qbCustomer.BillAddr.PostalCode,
                                country: qbCustomer.BillAddr.Country,
                                addressType: 'Billing',
                                telephoneNumber: qbCustomer.PrimaryPhone?.FreeFormNumber || '',
                            },
                        },
                    },
                });

                return { company, office };
            } catch (error) {
                console.error('Error creating QuickBooks customer:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create QuickBooks customer',
                });
            }
        }),

    updateCustomer: protectedProcedure
        .input(z.object({
            companyId: z.string(),
            officeName: z.string().optional(),
            billAddr: z.object({
                line1: z.string(),
                city: z.string(),
                country: z.string(),
                countrySubDivisionCode: z.string(),
                postalCode: z.string(),
            }),
            shipAddr: z.object({
                line1: z.string(),
                city: z.string(),
                country: z.string(),
                countrySubDivisionCode: z.string(),
                postalCode: z.string(),
            }).optional(),
            notes: z.string().optional(),
            displayName: z.string(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const accessToken = await refreshTokenIfNeeded(ctx);
            console.log('accessToken: ', accessToken);
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { quickbooksRealmId: true },
            });
            console.log('user: ', user);

            if (!user?.quickbooksRealmId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated with QuickBooks',
                });
            }
            console.log('user: ', user);
            // Fetch the company and office from our database
            const company = await ctx.db.company.findUnique({
                where: { id: input.companyId },
                include: { Offices: { include: { Addresses: true } } },
            });
            console.log('company: ', company);

            if (!company || !company.quickbooksId || !company.syncToken) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Company not found or not synced with QuickBooks',
                });
            }

            const office = company.Offices[0]; // Assuming the first office is the primary one

            if (!office) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Office not found for this company',
                });
            }

            const qbCustomerData = {
                Id: company.quickbooksId,
                SyncToken: company.syncToken,
                DisplayName: input.displayName,
                CompanyName: company.name,
                BillAddr: {
                    Line1: input.billAddr.line1,
                    City: input.billAddr.city,
                    Country: input.billAddr.country,
                    CountrySubDivisionCode: input.billAddr.countrySubDivisionCode,
                    PostalCode: input.billAddr.postalCode,
                },
                ShipAddr: input.shipAddr ? {
                    Line1: input.shipAddr.line1,
                    City: input.shipAddr.city,
                    Country: input.shipAddr.country,
                    CountrySubDivisionCode: input.shipAddr.countrySubDivisionCode,
                    PostalCode: input.shipAddr.postalCode,
                } : undefined,
                Notes: input.notes,
                PrimaryPhone: input.phone ? { FreeFormNumber: input.phone } : undefined,
                PrimaryEmailAddr: input.email ? { Address: input.email } : undefined,
            };

            try {
                const response = await axios.post(
                    `https://quickbooks.api.intuit.com/v3/company/${user.quickbooksRealmId}/customer`,
                    qbCustomerData,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const updatedQbCustomer = response.data.Customer;

                // Update Company in our database
                const updatedCompany = await ctx.db.company.update({
                    where: { id: company.id },
                    data: {
                        name: updatedQbCustomer.CompanyName,
                        syncToken: updatedQbCustomer.SyncToken,
                    },
                });

                // Update Office
                const updatedOffice = await ctx.db.office.update({
                    where: { id: office.id },
                    data: {
                        name: input.officeName || office.name,
                        Addresses: {
                            update: {
                                where: { id: office.Addresses[0]?.id },
                                data: {
                                    line1: updatedQbCustomer.BillAddr.Line1,
                                    city: updatedQbCustomer.BillAddr.City,
                                    state: updatedQbCustomer.BillAddr.CountrySubDivisionCode,
                                    zipCode: updatedQbCustomer.BillAddr.PostalCode,
                                    country: updatedQbCustomer.BillAddr.Country,
                                    telephoneNumber: updatedQbCustomer.PrimaryPhone?.FreeFormNumber || '',
                                },
                            },
                        },
                    },
                });

                return { company: updatedCompany, office: updatedOffice };
            } catch (error) {
                console.error('Error updating QuickBooks customer:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update QuickBooks customer',
                });
            }
        }),

    getCustomer: protectedProcedure
        .input(z.object({
            // Define input schema here
        }))
        .query(async ({ ctx, input }) => {
            // Implementation here
        }),

    syncOffice: protectedProcedure
        .input(z.object({
            officeId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
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

            const office = await ctx.db.office.findUnique({
                where: { id: input.officeId },
                include: {
                    Company: true,
                    Addresses: true,
                },
            });

            if (!office) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Office not found',
                });
            }

            // Check if the office already has a QuickBooks Customer ID
            if (office.quickbooksCustomerId) {
                // Pull data from QuickBooks and update local database
                return await pullFromQuickBooks(ctx, user.quickbooksRealmId, office, accessToken);
            } else {
                // Check if a matching customer exists in QuickBooks
                const existingCustomer = await findMatchingCustomerInQuickBooks(user.quickbooksRealmId, office, accessToken);

                if (existingCustomer) {
                    // Update local database with QuickBooks data
                    return await updateOfficeWithQuickBooksData(ctx, office, existingCustomer);
                } else {
                    // Push data to QuickBooks and create new customer
                    return await pushToQuickBooks(ctx, user.quickbooksRealmId, office, accessToken);
                }
            }
        }),

    syncCompany: protectedProcedure
        .input(z.object({
            companyId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { companyId } = input;

            // Fetch the company and its offices from the local database
            const company = await ctx.db.company.findUnique({
                where: { id: companyId },
                include: {
                    Offices: {
                        include: {
                            Addresses: true
                        }
                    }
                },
            });


            if (!company) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Company not found',
                });
            }

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

            const baseUrl = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox'
                ? 'https://sandbox-quickbooks.api.intuit.com'
                : 'https://quickbooks.api.intuit.com';

            // Function to fetch a customer from QuickBooks
            async function fetchCustomerFromQB(customerName: string) {
                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'User not found',
                    });
                }
                const query = `SELECT * FROM Customer WHERE FullyQualifiedName = '${customerName}'`;
                const url = `${baseUrl}/v3/company/${user.quickbooksRealmId}/query?query=${encodeURIComponent(query)}`;

                try {
                    const response = await axios.get(url, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json',
                        },
                    });

                    // Check if Customer array exists and has elements
                    if (response.data.QueryResponse.Customer && response.data.QueryResponse.Customer.length > 0) {
                        return response.data.QueryResponse.Customer[0];
                    } else {
                        return null; // Return null if no customer found
                    }
                } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                        console.error('Error fetching customer from QuickBooks:', error.response?.data || error.message);
                    } else {
                        console.error('Unexpected error fetching customer from QuickBooks:', error);
                    }
                    return null; // Return null on error
                }
            }

            // Function to create a customer in QuickBooks
            async function createCustomerInQB(customerData: any) {
                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'User not found',
                    });
                }
                const url = `${baseUrl}/v3/company/${user.quickbooksRealmId}/customer`;

                // Sanitize and prepare the minimum required data for creating a customer
                const qbCustomerData = {
                    DisplayName: sanitizeString(customerData.DisplayName).substring(0, 100), // Limit to 100 characters
                    BillAddr: {
                        Line1: sanitizeString(customerData.BillAddr.Line1 || ""),
                        City: sanitizeString(customerData.BillAddr.City || ""),
                        Country: "USA", // Assuming USA, adjust if necessary
                        CountrySubDivisionCode: sanitizeString(customerData.BillAddr.CountrySubDivisionCode || ""),
                        PostalCode: sanitizeString(customerData.BillAddr.PostalCode || "")
                    },
                    PrimaryPhone: customerData.PrimaryPhone ? {
                        FreeFormNumber: sanitizeString(customerData.PrimaryPhone.FreeFormNumber || "")
                    } : undefined,
                    PrimaryEmailAddr: customerData.PrimaryEmailAddr ? {
                        Address: customerData.PrimaryEmailAddr.Address || ""
                    } : undefined
                };
                // If ParentRef is provided, add it to the qbCustomerData object
                // ParentRef is only used when creating a sub customer in QuickBooks
                // Also add Job = true to the qbCustomerData object
                if ('ParentRef' in customerData && customerData.ParentRef) {
                    (qbCustomerData as any).ParentRef = customerData.ParentRef;
                    (qbCustomerData as any).Job = true;
                }
                console.log('qbCustomerData: ', qbCustomerData);
                try {
                    const response = await axios.post(url, qbCustomerData, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    return response.data.Customer;
                } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                        console.error('Error creating customer in QuickBooks:', error.response?.data || error.message);
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create customer in QuickBooks: ' + (error.response?.data?.Fault?.Error?.[0]?.Message || error.message),
                        });
                    } else {
                        console.error('Unexpected error creating customer in QuickBooks:', error);
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create customer in QuickBooks: ' + error,
                        });
                    }
                }
            }

            // Function to update a customer in QuickBooks
            async function updateCustomerInQB(customerData: any) {
                console.log('Updating customer in QuickBooks: ', customerData);
                if (!user) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'User is not authenticated',
                    });
                }
                const url = `${baseUrl}/v3/company/${user.quickbooksRealmId}/customer`;

                // Prepare the minimum required data for updating a customer
                const qbCustomerData = {
                    Id: customerData.Id,
                    SyncToken: customerData.SyncToken,
                    sparse: true,
                    DisplayName: customerData.DisplayName.substring(0, 100), // Limit to 100 characters
                    BillAddr: {
                        Id: customerData.BillAddr.Id,
                        Line1: customerData.BillAddr.Line1,
                        City: customerData.BillAddr.City,
                        Country: customerData.BillAddr.Country,
                        CountrySubDivisionCode: customerData.BillAddr.CountrySubDivisionCode,
                        PostalCode: customerData.BillAddr.PostalCode
                    },
                    PrimaryPhone: customerData.PrimaryPhone ? {
                        FreeFormNumber: customerData.PrimaryPhone.FreeFormNumber
                    } : undefined,
                    PrimaryEmailAddr: customerData.PrimaryEmailAddr ? {
                        Address: customerData.PrimaryEmailAddr.Address
                    } : undefined
                };

                // If ParentRef is provided, add it to the qbCustomerData object
                // ParentRef is only used when creating a sub customer in QuickBooks
                // Also add Job = true to the qbCustomerData object
                if ('ParentRef' in customerData && customerData.ParentRef) {
                    (qbCustomerData as any).ParentRef = customerData.ParentRef;
                    (qbCustomerData as any).Job = true;
                }
                console.log('qbCustomerData: ', qbCustomerData);
                try {
                    const response = await axios.post(url, qbCustomerData, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    return response.data.Customer;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error('Error updating customer in QuickBooks:', error.response?.data);
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update customer in QuickBooks: ' + (error.response?.data?.Fault?.Error?.[0]?.Message || error.message),
                        });
                    } else {
                        console.error('Unexpected error updating customer in QuickBooks:', error);
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to update customer in QuickBooks: ' + error,
                        });
                    }
                }
            }

            // Sync company
            let qbCompany = await fetchCustomerFromQB(company.name);
            // For creating a new company in QuickBooks:
            if (!qbCompany) {
                // Customer doesn't exist in QuickBooks, create it
                try {
                    qbCompany = await createCustomerInQB({
                        DisplayName: company.name,
                        BillAddr: {
                            Line1: company.Offices[0]?.Addresses[0]?.line1 || "",
                            City: company.Offices[0]?.Addresses[0]?.city || "",
                            CountrySubDivisionCode: company.Offices[0]?.Addresses[0]?.state || "",
                            PostalCode: company.Offices[0]?.Addresses[0]?.zipCode || "",
                        },
                        PrimaryPhone: {
                            FreeFormNumber: company.Offices[0]?.Addresses[0]?.telephoneNumber || "",
                        },
                        // Add PrimaryEmailAddr if available
                    });
                    // Update local database with QuickBooks ID and SyncToken
                    await ctx.db.company.update({
                        where: { id: companyId },
                        data: {
                            quickbooksId: qbCompany.Id,
                            syncToken: qbCompany.SyncToken,
                        },
                    });
                } catch (error) {
                    console.error('Failed to create company in QuickBooks:', error);
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create company in QuickBooks',
                    });
                }
            } else if (company.updatedAt > new Date(qbCompany.MetaData.LastUpdatedTime)) {
                // Update QuickBooks
                qbCompany = await updateCustomerInQB({
                    Id: qbCompany.Id,
                    SyncToken: qbCompany.SyncToken,
                    DisplayName: company.name,
                    BillAddr: {
                        Id: qbCompany.BillAddr.Id,
                        Line1: company.Offices[0]?.Addresses[0]?.line1 || qbCompany.BillAddr.Line1,
                        City: company.Offices[0]?.Addresses[0]?.city || qbCompany.BillAddr.City,
                        Country: "USA", // Assuming USA, adjust if necessary
                        CountrySubDivisionCode: company.Offices[0]?.Addresses[0]?.state || qbCompany.BillAddr.CountrySubDivisionCode,
                        PostalCode: company.Offices[0]?.Addresses[0]?.zipCode || qbCompany.BillAddr.PostalCode,
                    },
                    PrimaryPhone: {
                        FreeFormNumber: company.Offices[0]?.Addresses[0]?.telephoneNumber || qbCompany.PrimaryPhone?.FreeFormNumber,
                    },
                    // Add PrimaryEmailAddr if available
                });
            }

            // Sync offices
            for (const office of company.Offices) {
                const officeName = `${company.name}:${office.name}`;
                let qbOffice = await fetchCustomerFromQB(officeName);

                if (qbOffice) {
                    if (new Date(qbOffice.MetaData.LastUpdatedTime) > office.updatedAt) {
                        // Update local database
                        await ctx.db.office.update({
                            where: { id: office.id },
                            data: {
                                name: office.name,
                                quickbooksCustomerId: qbOffice.Id,
                                syncToken: qbOffice.SyncToken,
                            },
                        });
                    } else if (office.updatedAt > new Date(qbOffice.MetaData.LastUpdatedTime)) {
                        // Update QuickBooks
                        qbOffice = await updateCustomerInQB({
                            Id: qbOffice.Id,
                            SyncToken: qbOffice.SyncToken,
                            DisplayName: office.name,
                            CompanyName: company.name,
                            BillAddr: {
                                Id: qbOffice.BillAddr.Id,
                                Line1: office.Addresses[0]?.line1 || "",
                                City: office.Addresses[0]?.city || "",
                                Country: office.Addresses[0]?.country || "",
                                CountrySubDivisionCode: office.Addresses[0]?.state || "",
                                PostalCode: office.Addresses[0]?.zipCode || "",
                            },
                            // Add other fields as needed
                        });
                    }
                } else {
                    // Create in QuickBooks
                    qbOffice = await createCustomerInQB({
                        DisplayName: office.name,
                        CompanyName: company.name,
                        ParentRef: {
                            value: company.quickbooksId,
                            name: company.name,
                        },
                        BillAddr: {
                            Line1: office.Addresses[0]?.line1 || "",
                            City: office.Addresses[0]?.city || "",
                            Country: office.Addresses[0]?.country || "",
                            CountrySubDivisionCode: office.Addresses[0]?.state || "",
                            PostalCode: office.Addresses[0]?.zipCode || "",
                        },
                        // Add other required fields
                    });
                    await ctx.db.office.update({
                        where: { id: office.id },
                        data: {
                            quickbooksCustomerId: qbOffice.Id,
                            syncToken: qbOffice.SyncToken,
                        },
                    });
                }
            }

            return { message: 'Company and offices synced successfully' };
        }),
});