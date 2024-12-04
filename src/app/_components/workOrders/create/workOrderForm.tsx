import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation'
import { type SerializedWorkOrder } from '~/types/serializedTypes';
import { CustomComboBox } from '~/app/_components/shared/CustomComboBox';
import { Button } from '~/app/_components/ui/button';

const workOrderSchema = z.object({
    costPerM: z.number().default(0),
    dateIn: z.string().min(1, 'Date In is required'),
    contactPersonId: z.string().min(1, 'Contact Person is required'),
    estimateNumber: z.string().optional(),
    inHandsDate: z.string(),
    invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
    purchaseOrderNumber: z.string().optional(),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']).default('Draft'),
    version: z.number().default(0),
    workOrderNumber: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface Company {
    id: string;
    name: string;
}

interface Office {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    name: string | null;
}

const WorkOrderForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const { setCurrentStep, setWorkOrder } = useContext(WorkOrderContext);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { data: companyData } = api.companies.getAll.useQuery();
    const { data: officeData, refetch: refetchOffices } = api.offices.getByCompanyId.useQuery(selectedCompany || '', { enabled: false });
    const { data: employeeData, refetch: refetchEmployees } = api.users.getByOfficeId.useQuery(selectedOffice || '', { enabled: false });
    const createWorkOrderMutation = api.workOrders.createWorkOrder.useMutation<SerializedWorkOrder>();
    const router = useRouter();
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

   useEffect(() => {
    if (companyData) {
        const formattedCompanies = companyData.map(company => ({
            id: company.id,
            name: company.name
        })).filter(company => company.name); // Filter out any null names

        setCompanies(formattedCompanies);
        setIsLoadingCompanies(false);
        }
    }, [companyData]);

    useEffect(() => {
        if (selectedCompany) {
            setIsLoadingOffices(true);
            refetchOffices();
        }
    }, [selectedCompany, refetchOffices]);

    useEffect(() => {
        if (officeData) {
            setOffices(officeData.map(office => ({
                id: office.id,
                name: office.name
            })));
            setIsLoadingOffices(false);
        }
    }, [officeData]);

    useEffect(() => {
        if (selectedOffice) {
            setIsLoadingEmployees(true);
            refetchEmployees();
        }
    }, [selectedOffice, refetchEmployees]);

    useEffect(() => {
        if (employeeData) {
            setEmployees(employeeData.map(employee => ({
                id: employee.id,
                name: employee.name
            })));
            setIsLoadingEmployees(false);
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
            onSuccess: (createdWorkOrder: SerializedWorkOrder) => {
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
                <div className="flex flex-col space-y-1.5">
                    <label htmlFor="company">Company</label>
                    <CustomComboBox
                        options={companies.map(company => ({
                            value: company.id,
                            label: company.name ?? 'Unnamed Company'
                        }))}
                        value={selectedCompany ?? ""}
                        onValueChange={setSelectedCompany}
                        placeholder={isLoadingCompanies ? "Loading..." : "Select company..."}
                        emptyText="No company found."
                        searchPlaceholder="Search company..."
                        className="w-[300px]"
                    />
                </div>

                {selectedCompany && (
                    <div className="flex flex-col space-y-1.5">
                        <label htmlFor="office">Office</label>
                        <CustomComboBox
                            options={offices.map(office => ({
                                value: office.id,
                                label: office.name ?? 'Unnamed Office'
                            }))}
                            value={selectedOffice ?? ""}
                            onValueChange={setSelectedOffice}
                            placeholder={isLoadingOffices ? "Loading..." : "Select office..."}
                            emptyText="No office found."
                            searchPlaceholder="Search office..."
                            className="w-[300px]"
                        />
                    </div>
                )}

                {selectedOffice && (
                    <div className="flex flex-col space-y-1.5">
                        <label htmlFor="contactPersonId">Contact Person</label>
                        <CustomComboBox
                            options={employees.map(employee => ({
                                value: employee.id,
                                label: employee.name ?? `Employee ${employee.id}`
                            }))}
                            value={watch('contactPersonId') ?? ""}
                            onValueChange={(value) => setValue('contactPersonId', value)}
                            placeholder={isLoadingEmployees ? "Loading..." : "Select contact..."}
                            emptyText="No contact found."
                            searchPlaceholder="Search contact..."
                            className="w-[300px]"
                        />
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
                    <input id="workOrderNumber" {...register('workOrderNumber', {
                        setValueAs: v => v === '' ? undefined : v
                    })} className="input input-bordered w-full" />
                    {errors.workOrderNumber && <p className="text-red-500">{errors.workOrderNumber.message}</p>}
                </div>
                <div className="flex flex-col space-y-1.5">
                    <label htmlFor="invoicePrintEmail">Invoice Type</label>
                    <CustomComboBox
                        options={[
                            { value: 'Print', label: 'Print' },
                            { value: 'Email', label: 'Email' },
                            { value: 'Both', label: 'Both' }
                        ]}
                        value={watch('invoicePrintEmail') ?? ""}
                        onValueChange={(value) => setValue('invoicePrintEmail', value as 'Print' | 'Email' | 'Both')}
                        placeholder="Select type..."
                        emptyText="No type found."
                        searchPlaceholder="Search type..."
                        className="w-[300px]"
                    />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <label htmlFor="status">Status</label>
                    <CustomComboBox
                        options={[
                            { value: 'Approved', label: 'Approved' },
                            { value: 'Cancelled', label: 'Cancelled' },
                            { value: 'Draft', label: 'Draft' },
                            { value: 'Pending', label: 'Pending' }
                        ]}
                        value={watch('status') ?? ""}
                        onValueChange={(value) => setValue('status', value as 'Approved' | 'Cancelled' | 'Draft' | 'Pending')}
                        placeholder="Select status..."
                        emptyText="No status found."
                        searchPlaceholder="Search status..."
                        className="w-[300px]"
                    />
                </div>
                <Button type="submit">Submit and Next Step</Button>
            </form>
        </div>
    );
};

export default WorkOrderForm;