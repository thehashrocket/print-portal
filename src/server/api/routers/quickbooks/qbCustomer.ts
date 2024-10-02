import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import OAuthClient from 'intuit-oauth';
import { TRPCError } from "@trpc/server";
import { refreshTokenIfNeeded } from "~/services/quickbooksService";
import { z } from 'zod';
import { Company, Address, Office } from '@prisma/client';
import axios from 'axios';

const oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    environment: process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
    redirectUri: `${process.env.NEXTAUTH_URL}/api/quickbooks/callback`,
    logging: true
});

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

            // Fetch the company and office from our database
            const company = await ctx.db.company.findUnique({
                where: { id: input.companyId },
                include: { Offices: { include: { Addresses: true } } },
            });

            if (!company || !company.quickbooksId || !company.syncToken) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Company not found or not synced with QuickBooks',
                });
            }

            const office = company.Offices[0]; // Assuming the first office is the primary one

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
                                where: { id: office.Addresses[0].id },
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
});