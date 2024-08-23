import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation'

const workOrderSchema = z.object({
    costPerM: z.number().default(0),
    dateIn: z.string().min(1, 'Date In is required'),
    contactPersonId: z.string().min(1, 'Contact Person is required'),
    estimateNumber: z.string().min(1, 'Estimate Number is required'),
    inHandsDate: z.string(),
    invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
    purchaseOrderNumber: z.string().min(1, 'Purchase Order Number is required'),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']).default('Draft'),
    version: z.number().default(0),
    workOrderNumber: z.number().default(0),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const WorkOrderForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { setCurrentStep, setWorkOrder } = useContext(WorkOrderContext);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const { data: companyData } = api.companies.getAll.useQuery();
    const { data: officeData, refetch: refetchOffices } = api.offices.getByCompanyId.useQuery(selectedCompany || '', { enabled: false });
    const { data: employeeData, refetch: refetchEmployees } = api.users.getByOfficeId.useQuery(selectedOffice || '', { enabled: false });
    const createWorkOrderMutation = api.workOrders.createWorkOrder.useMutation();
    const router = useRouter()

    useEffect(() => {
        if (companyData) {
            setCompanies(companyData);
        }
    }, [companyData]);

    useEffect(() => {
        if (selectedCompany) {
            refetchOffices();
        }
    }, [selectedCompany, refetchOffices]);

    useEffect(() => {
        if (officeData) {
            setOffices(officeData);
        }
    }, [officeData]);

    useEffect(() => {
        if (selectedOffice) {
            refetchEmployees();
        }
    }, [selectedOffice, refetchEmployees]);

    useEffect(() => {
        if (employeeData) {
            setEmployees(employeeData);
        }
    }, [employeeData]);

    const handleFormSubmit = handleSubmit((data: WorkOrderFormData) => {
        const newWorkOrder = {
            ...data,
            officeId: selectedOffice ? selectedOffice : '',
            shippingInfoId: null,
            createdById: '',
            dateIn: data.dateIn ? new Date(data.dateIn) : new Date(),
            inHandsDate: data.inHandsDate ? new Date(data.inHandsDate) : new Date(),
        };

        createWorkOrderMutation.mutate(newWorkOrder, {
            onSuccess: (createdWorkOrder) => {
                setWorkOrder(createdWorkOrder);
                router.push(`/workOrders/create/${createdWorkOrder.id}`)
            },
            onError: (error) => {
                console.error('Error creating work order:', error);
            },
        });
    });

    return (
        <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                {selectedOffice && (
                    <div>
                        <label htmlFor="contactPersonId" className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <select
                            id="contactPersonId"
                            {...register('contactPersonId')}
                            onChange={(e) => setValue('contactPersonId', e.target.value)}
                            className="select select-bordered w-full"
                        >
                            <option value="">Select a Contact Person</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                            ))}
                        </select>
                        {errors.contactPersonId && <p className="text-red-500">{errors.contactPersonId.message}</p>}
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
                    <label htmlFor="workOrderNumber" className="block text-sm font-medium text-gray-700">Job Number</label>
                    <input id="workOrderNumber" type="number" {...register('workOrderNumber', { valueAsNumber: true })} className="input input-bordered w-full" />
                    {errors.workOrderNumber && <p className="text-red-500">{errors.workOrderNumber.message}</p>}
                </div>
                <div>
                    <label htmlFor="invoicePrintEmail" className="block text-sm font-medium text-gray-700">Invoice Type</label>
                    <select id="invoicePrintEmail" {...register('invoicePrintEmail')} className="select select-bordered w-full">
                        <option value="Print">Print</option>
                        <option value="Email">Email</option>
                        <option value="Both">Both</option>
                    </select>
                    {errors.invoicePrintEmail && <p className="text-red-500">{errors.invoicePrintEmail.message}</p>}
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
                <button type="submit" className="btn btn-primary">Submit and Next Step</button>
            </form>
        </div>
    );
};

export default WorkOrderForm;