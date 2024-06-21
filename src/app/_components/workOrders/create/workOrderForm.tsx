// ~/app/_components/workOrders/create/WorkOrderForm.tsx
"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation'

const workOrderSchema = z.object({
    costPerM: z.number().default(0),
    dateIn: z.string(),
    deposit: z.number().default(0),
    description: z.string().nullable().default(null),
    estimateNumber: z.string().min(1, 'Estimate Number is required'),
    expectedDate: z.string().optional(),
    inHandsDate: z.string(),
    invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
    prepTime: z.number().optional().nullable().default(null),
    purchaseOrderNumber: z.string().min(1, 'Purchase Order Number is required'),
    specialInstructions: z.string().optional().nullable().default(null),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']),
    totalCost: z.number().optional().nullable().default(null),
    version: z.number().default(0),
    workOrderNumber: z.number().default(0),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const WorkOrderForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { setCurrentStep, setWorkOrder } = useContext(WorkOrderContext);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const { data: companyData } = api.companies.getAll.useQuery();
    const { data: officeData, refetch: refetchOffices } = api.offices.getByCompanyId.useQuery(selectedCompany || '', { enabled: false });
    const createWorkOrderMutation = api.workOrders.createWorkOrder.useMutation();
    const router = useRouter()

    useEffect(() => {
        if (companyData) {
            setCompanies(companyData);
            console.log('Fetched companies:', companyData);  // Log fetched companies
        }
    }, [companyData]);

    useEffect(() => {
        if (selectedCompany) {
            console.log('Selected company:', selectedCompany);  // Log selected company
            refetchOffices();
        }
    }, [selectedCompany, refetchOffices]);

    useEffect(() => {
        if (officeData) {
            setOffices(officeData);
            console.log('Fetched offices:', officeData);  // Log fetched offices
        }
    }, [officeData]);

    const handleFormSubmit = handleSubmit((data: WorkOrderFormData) => {
        console.log('Form data:', data);  // Log form data

        const newWorkOrder = {
            ...data,
            officeId: selectedOffice ? selectedOffice : '',
            shippingInfoId: null,
            createdById: '',
            deposit: data.deposit,
            totalCost: data.totalCost ? data.totalCost : null,
            dateIn: data.dateIn ? new Date(data.dateIn) : '',
            inHandsDate: data.inHandsDate ? new Date(data.inHandsDate) : '',
            expectedDate: data.expectedDate ? new Date(data.expectedDate) : '',
        };

        console.log('Prepared new work order data:', newWorkOrder);  // Log prepared work order data

        createWorkOrderMutation.mutate(newWorkOrder, {
            onSuccess: (createdWorkOrder) => {
                console.log('Created work order:', createdWorkOrder);  // Log created work order
                setWorkOrder(createdWorkOrder);
                // setCurrentStep(prev => prev + 1);
                // Navigate to /workOrders/create/[id]/page
                router.push(`/workOrders/create/${createdWorkOrder.id}`) // Navigate to the new post page
            },
            onError: (error) => {
                console.error('Error creating work order:', error);  // Log error
            },
        });
    });

    return (
        <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Form fields */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input id="description" {...register('description')} className="input input-bordered w-full" />
                    {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                </div>
                <div>
                    <label htmlFor="workOrderNumber" className="block text-sm font-medium text-gray-700">Work Order Number</label>
                    <input id="workOrderNumber" type="number" {...register('workOrderNumber', { valueAsNumber: true })} className="input input-bordered w-full" />
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
                {/* Additional form fields */}
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
                    <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700">Expected Date</label>
                    <input id="expectedDate" type="date" {...register('expectedDate')} className="input input-bordered w-full" />
                    {errors.expectedDate && <p className="text-red-500">{errors.expectedDate.message}</p>}
                </div>
                <div>
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">Deposit</label>
                    <input id="deposit" type="number" step="0.01" {...register('deposit', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.deposit && <p className="text-red-500">{errors.deposit.message}</p>}
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
                    <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Prep Time</label>
                    <input id="prepTime" type="number" {...register('prepTime', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.prepTime && <p className="text-red-500">{errors.prepTime.message}</p>}
                </div>
                <div>
                    <label htmlFor="estimateNumber" className="block text-sm font-medium text-gray-700">Estimate Number</label>
                    <input id="estimateNumber" {...register('estimateNumber')} className="input input-bordered w-full" />
                    {errors.estimateNumber && <p className="text-red-500">{errors.estimateNumber.message}</p>}
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
                    <input id="totalCost" type="number" step="0.01" {...register('totalCost', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.totalCost && <p className="text-red-500">{errors.totalCost.message}</p>}
                </div>
                <button type="submit" className="btn btn-primary">Submit and Next Step</button>
            </form>
        </div>
    );
};

export default WorkOrderForm;
