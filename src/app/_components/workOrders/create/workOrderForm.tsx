// ~/app/_components/workOrders/create/WorkOrderForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';
import { api } from '~/trpc/react';
import { InvoicePrintEmailOptions, WorkOrder, WorkOrderStatus } from '@prisma/client';


const workOrderSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    invoicePrintEmailOptions: z.enum(['Print', 'Email', 'Both']),
    workOrderNumber: z.number().min(1, 'Work Order Number is required'),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']),
    dateIn: z.date().refine(val => val <= new Date(), 'Date In must be in the past'),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
    nextStep: () => void;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ nextStep }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { addWorkOrder } = useWorkOrderContext();
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

    const handleShippingInfoSubmit = (data: any) => {
        // Handle the creation of ShippingInfo and associate it with the WorkOrder
    };

    const onSubmit = (data: WorkOrderFormData) => {
        addWorkOrder({
            ...data,
            officeId: selectedOffice!,
            // Assume shippingInfoId is managed via the handleShippingInfoSubmit function
            shippingInfoId: 'some-shipping-info-id',
            deposit: '',
            estimateNumber: '',
            expectedDate: null,
            inHandsDate: new Date,
            invoicePrintEmail: 'Print',
            overUnder: null,
            plateRan: null,
            prepTime: null,
            purchaseOrderNumber: '',
            specialInstructions: null,
            totalCost: null,
            version: 0
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
                    <input id="workOrderNumber" type="number" {...register('workOrderNumber')} className="input input-bordered w-full" />
                    {errors.workOrderNumber && <p className="text-red-500">{errors.workOrderNumber.message}</p>}
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" {...register('status')} className="select select-bordered w-full">
                        {/* Loop through WorkOrderStatus to create select options */}
                        {Object.values(WorkOrderStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    {errors.status && <p className="text-red-500">{errors.status.message}</p>}
                </div>
                <div>
                    {/* Select option for invoicePrintEmail */}
                    <label htmlFor="invoicePrintEmail" className="block text-sm font-medium text-gray-700">Invoice Print Email</label>
                    <select id="invoicePrintEmail" {...register('invoicePrintEmailOptions')} className="select select-bordered w-full">
                        {/* Loop through InvoicePrintEmailOptions to create select options */}
                        {Object.values(InvoicePrintEmailOptions).map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
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
                <button type="submit" className="btn btn-primary">Next</button>
            </form>
        </div>
    );
};

export default WorkOrderForm;

