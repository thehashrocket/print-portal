// ~/app/_components/workOrders/create/WorkOrderForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';
import { api } from '~/trpc/react';

const workOrderSchema = z.object({
    description: z.string().nullable().default(null), // Make description nullable
    workOrderNumber: z.number().default(0), // Default value to ensure it's always a number
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']),
    dateIn: z.string(), // Use string to allow date input in HTML
    inHandsDate: z.string(), // Use string to allow date input in HTML
    costPerM: z.number().default(0),
    deposit: z.number().default(0),
    estimateNumber: z.string().min(1, 'Estimate Number is required'),
    expectedDate: z.string().optional(), // Use string to allow date input in HTML
    invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
    overUnder: z.string().optional().nullable().default(null), // Make optional fields nullable
    plateRan: z.string().optional().nullable().default(null),
    prepTime: z.number().optional().nullable().default(null),
    purchaseOrderNumber: z.string().min(1, 'Purchase Order Number is required'),
    specialInstructions: z.string().optional().nullable().default(null),
    totalCost: z.number().optional().nullable().default(null),
    version: z.number().default(0), // Add version field
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
    nextStep: () => void;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ nextStep }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { addWorkOrder, setWorkOrderId } = useWorkOrderContext();
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const { data: companyData } = api.companies.getAll.useQuery();
    const { data: officeData, refetch: refetchOffices } = api.offices.getByCompanyId.useQuery(selectedCompany || '', { enabled: false });

    useEffect(() => {
        if (companyData) setCompanies(companyData);
    }, [companyData]);

    useEffect(() => {
        if (selectedCompany) refetchOffices();
    }, [selectedCompany, refetchOffices]);

    useEffect(() => {
        if (officeData) setOffices(officeData);
    }, [officeData]);

    const onSubmit = (data: WorkOrderFormData) => {
        addWorkOrder({
            ...data,
            officeId: selectedOffice!,
            shippingInfoId: 'some-shipping-info-id', // This will be set later
            createdById: '', // This should be set from the session
            deposit: new Decimal(data.deposit),
            totalCost: data.totalCost ? new Decimal(data.totalCost) : null,
            dateIn: new Date(data.dateIn), // Convert string to Date
            inHandsDate: new Date(data.inHandsDate), // Convert string to Date
            expectedDate: data.expectedDate ? new Date(data.expectedDate) : null, // Convert string to Date
        });
        nextStep();
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input id="description" {...register('description')} className="input input-bordered w-full" />
                    {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                </div>
                <div>
                    <label htmlFor="workOrderNumber" className="block text-sm font-medium text-gray-700">Work Order Number</label>
                    <input
                        id="workOrderNumber"
                        type="number"
                        {...register('workOrderNumber', {
                            valueAsNumber: true // Ensure value is treated as a number
                        })}
                        className="input input-bordered w-full"
                    />
                    {errors.workOrderNumber && <p className="text-red-500">{errors.workOrderNumber.message}</p>}
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" {...register('status')} className="select select-bordered w-full">
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                    </select>
                    {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <select id="company" onChange={(e) => setSelectedCompany(e.target.value)} className="select select-bordered w-full">
                        <option value="">Select a Company</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
                </div>
                {selectedCompany && (
                    <div>
                        <label htmlFor="office" className="block text-sm font-medium text-gray-700">Office</label>
                        <select id="office" onChange={(e) => setSelectedOffice(e.target.value)} className="select select-bordered w-full">
                            <option value="">Select an Office</option>
                            {offices.map((office) => (
                                <option key={office.id} value={office.id}>{office.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="dateIn" className="block text-sm font-medium text-gray-700">Date In</label>
                    <input id="dateIn" type="date" {...register('dateIn')} className="input input-bordered w-full" />
                    {errors.dateIn && <p className="text-red-500">{errors.dateIn.message}</p>}
                </div>
                <div>
                    <label htmlFor="inHandsDate" className="block text-sm font-medium text-gray-700">In Hands Date</label>
                    <input id="inHandsDate" type="date" {...register('inHandsDate')} className="input input-bordered w-full" />
                    {errors.inHandsDate && <p className="text-red-500">{errors.inHandsDate.message}</p>}
                </div>
                <div>
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">Deposit</label>
                    <input id="deposit" type="number" step="0.01" {...register('deposit', {
                        valueAsNumber: true // Ensure value is treated as a number
                    })} className="input input-bordered w-full" />
                    {errors.deposit && <p className="text-red-500">{errors.deposit.message}</p>}
                </div>
                <div>
                    <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700">Expected Date</label>
                    <input id="expectedDate" type="date" {...register('expectedDate')} className="input input-bordered w-full" />
                    {errors.expectedDate && <p className="text-red-500">{errors.expectedDate.message}</p>}
                </div>
                <div>
                    <label htmlFor="invoicePrintEmail" className="block text-sm font-medium text-gray-700">Invoice Print/Email</label>
                    <select id="invoicePrintEmail" {...register('invoicePrintEmail')} className="select select-bordered w-full">
                        <option value="Print">Print</option>
                        <option value="Email">Email</option>
                        <option value="Both">Both</option>
                    </select>
                    {errors.invoicePrintEmail && <p className="text-red-500">{errors.invoicePrintEmail.message}</p>}
                </div>
                <div>
                    <label htmlFor="overUnder" className="block text-sm font-medium text-gray-700">Over/Under</label>
                    <input id="overUnder" {...register('overUnder')} className="input input-bordered w-full" />
                    {errors.overUnder && <p className="text-red-500">{errors.overUnder.message}</p>}
                </div>
                <div>
                    <label htmlFor="plateRan" className="block text-sm font-medium text-gray-700">Plate Ran</label>
                    <input id="plateRan" {...register('plateRan')} className="input input-bordered w-full" />
                    {errors.plateRan && <p className="text-red-500">{errors.plateRan.message}</p>}
                </div>
                <div>
                    <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Prep Time</label>
                    <input id="prepTime" type="number" {...register('prepTime', {
                        valueAsNumber: true // Ensure value is treated as a number
                    })} className="input input-bordered w-full" />
                    {errors.prepTime && <p className="text-red-500">{errors.prepTime.message}</p>}
                </div>
                <div>
                    <label htmlFor="purchaseOrderNumber" className="block text-sm font-medium text-gray-700">Purchase Order Number</label>
                    <input id="purchaseOrderNumber" {...register('purchaseOrderNumber')} className="input input-bordered w-full" />
                    {errors.purchaseOrderNumber && <p className="text-red-500">{errors.purchaseOrderNumber.message}</p>}
                </div>
                <div>
                    <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">Special Instructions</label>
                    <textarea id="specialInstructions" {...register('specialInstructions')} className="textarea textarea-bordered w-full"></textarea>
                </div>
                <div>
                    <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">Total Cost</label>
                    <input id="totalCost" type="number" step="0.01" {...register('totalCost', {
                        valueAsNumber: true // Ensure value is treated as a number
                    })} className="input input-bordered w-full" />
                    {errors.totalCost && <p className="text-red-500">{errors.totalCost.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary">Next</button>
            </form>
        </div>
    );
};

export default WorkOrderForm;

