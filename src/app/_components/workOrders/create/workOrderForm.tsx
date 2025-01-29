import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation'
import { type SerializedWorkOrder } from '~/types/serializedTypes';
import { CustomComboBox } from '~/app/_components/shared/ui/CustomComboBox';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { cn } from "~/lib/utils";
import { PlusCircle, Loader2 } from "lucide-react";
import { CreateContactModal } from '~/app/_components/shared/contacts/createContactModal';
import debounce from "lodash/debounce";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

const workOrderSchema = z.object({
    dateIn: z.string().min(1, 'Date In is required'),
    officeId: z.string().min(1, 'Office is required'),
    contactPersonId: z.string().optional().nullable(),
    estimateNumber: z.string().optional().nullable(),
    inHandsDate: z.string().min(1, 'In Hands Date is required'),
    invoicePrintEmail: z.enum(['Print', 'Email', 'Both']),
    purchaseOrderNumber: z.string().optional().nullable(),
    status: z.enum(['Approved', 'Cancelled', 'Draft', 'Pending']).default('Draft'),
    version: z.number().default(0),
    workOrderNumber: z.string().optional().nullable(),
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
    const { register, handleSubmit, formState: { errors }, setValue, watch, clearErrors } = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderSchema),
    });
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const { data: companyData, isFetching: isCompanyFetching } = api.companies.search.useQuery(
        { searchTerm: debouncedSearchTerm },
        { 
            enabled: true,
            staleTime: 30000, // Cache results for 30 seconds
            placeholderData: (previousData) => previousData // This replaces keepPreviousData
        }
    );
    const { data: officeData, refetch: refetchOffices } = api.offices.getByCompanyId.useQuery(selectedCompany || '', { enabled: false });
    const { data: employeeData, refetch: refetchEmployees } = api.users.getByOfficeId.useQuery(selectedOffice || '', { enabled: false });
    const createWorkOrderMutation = api.workOrders.createWorkOrder.useMutation<SerializedWorkOrder>();
    const router = useRouter();
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);

    // Add CopilotKit readable context
    useCopilotReadable({
        description: "Current form values for the work order being created",
        value: {
            formValues: {
                dateIn: watch('dateIn'),
                inHandsDate: watch('inHandsDate'),
                estimateNumber: watch('estimateNumber'),
                purchaseOrderNumber: watch('purchaseOrderNumber'),
                workOrderNumber: watch('workOrderNumber'),
                invoicePrintEmail: watch('invoicePrintEmail'),
                status: watch('status'),
            },
            formErrors: Object.keys(errors).length > 0 ? Object.fromEntries(
                Object.entries(errors).map(([key, value]) => [key, value.message])
            ) : {},
            selectedCompany,
            selectedOffice
        },
    });

    useCopilotReadable({
        description: "Available companies, offices, and employees for selection",
        value: {
            companies: companies.map(c => ({ id: c.id, name: c.name })),
            offices: offices.map(o => ({ id: o.id, name: o.name })),
            employees: employees.map(e => ({ id: e.id, name: e.name })),
            isLoadingCompanies,
            isLoadingOffices,
            isLoadingEmployees
        },
    });

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

    const debouncedSearch = useMemo(
        () =>
            debounce((term: string) => {
                setDebouncedSearchTerm(term);
            }, 300),
        []
    );

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const handleFormSubmit = handleSubmit((data: WorkOrderFormData) => {
        console.log('Form submitted with data:', data);
        console.log('Form errors:', errors);
        
        if (!selectedOffice) {
            console.error('No office selected');
            return;
        }

        const newWorkOrder = {
            ...data,
            officeId: selectedOffice,
            shippingInfoId: null,
            createdById: '',
            dateIn: data.dateIn ? new Date(data.dateIn + 'T12:00:00') : new Date(),
            inHandsDate: data.inHandsDate ? new Date(data.inHandsDate + 'T12:00:00') : new Date(),
        };
        console.log('Submitting work order:', newWorkOrder);

        createWorkOrderMutation.mutate(newWorkOrder, {
            onSuccess: (createdWorkOrder: SerializedWorkOrder) => {
                router.push(`/workOrders/create/${createdWorkOrder.id}`)
            },
            onError: (error) => {
                console.error('Error creating work order:', error);
            },
        });
    }, (errors) => {
        console.log('Form validation errors:', errors);
        return false;
    });

    return (
        <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Company Section */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <CustomComboBox
                            options={companies.map(company => ({
                                value: company.id,
                                label: company.name ?? 'Unnamed Company'
                            }))}
                            value={selectedCompany ?? ""}
                            onValueChange={setSelectedCompany}
                            placeholder={isLoadingCompanies ? "Loading..." : "Select company..."}
                            emptyText={
                                isCompanyFetching 
                                    ? "Loading..." 
                                    : searchTerm 
                                        ? "No companies found" 
                                        : "Type to search companies..."
                            }
                            searchPlaceholder="Search company..."
                            className="w-[300px]"
                            onSearchChange={handleSearch}
                            showSpinner={isCompanyFetching}
                        />
                        {isCompanyFetching && (
                            <Loader2 className="h-4 w-4 animate-spin absolute right-8 top-3 text-gray-500" />
                        )}
                    </div>
                </div>

                {/* Office Section */}
                {selectedCompany && (
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="office">Office <span className="text-red-500">*</span></Label>
                        <CustomComboBox
                            options={offices.map(office => ({
                                value: office.id,
                                label: office.name ?? 'Unnamed Office'
                            }))}
                            value={selectedOffice ?? ""}
                            onValueChange={(value) => {
                                setSelectedOffice(value);
                                setValue('officeId', value);
                                clearErrors('officeId');
                            }}
                            placeholder={isLoadingOffices ? "Loading..." : "Select office..."}
                            emptyText="No office found."
                            searchPlaceholder="Search office..."
                            className="w-[300px]"
                        />
                    </div>
                )}

                {/* Contact Person Section */}
                {selectedOffice && (
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="contactPersonId" className="flex gap-1">
                            Contact Person
                        </Label>
                        <div className="flex gap-2 items-start">
                            <CustomComboBox
                                options={employees.map(employee => ({
                                    value: employee.id,
                                    label: employee.name ?? `Employee ${employee.id}`
                                }))}
                                value={watch('contactPersonId') ?? ""}
                                onValueChange={(value) => {
                                    setValue('contactPersonId', value);
                                    clearErrors('contactPersonId');
                                }}
                                placeholder={isLoadingEmployees ? "Loading..." : "Select contact..."}
                                emptyText="No contact found."
                                searchPlaceholder="Search contact..."
                                className={cn(
                                    "w-[300px]",
                                    errors.contactPersonId && "border-red-500"
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-[#006739] hover:text-[#005730]"
                                onClick={() => setIsCreateContactModalOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Create Contact
                            </Button>
                        </div>
                        {errors.contactPersonId && (
                            <p className="text-sm text-red-500">{errors.contactPersonId.message}</p>
                        )}
                        <CreateContactModal
                            isOpen={isCreateContactModalOpen}
                            onClose={() => setIsCreateContactModalOpen(false)}
                            officeId={selectedOffice}
                            onContactCreated={(newContact) => {
                                setEmployees(prev => [...prev, newContact]);
                                setValue('contactPersonId', newContact.id);
                                refetchEmployees();
                            }}
                        />
                    </div>
                )}

                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="dateIn" className="flex gap-1">
                        Date In<span className="text-red-500">*</span>
                    </Label>
                    <input 
                        id="dateIn" 
                        type="date" 
                        {...register('dateIn')} 
                        className={cn(
                            "flex h-10 w-full rounded-md border px-3",
                            errors.dateIn && "border-red-500"
                        )}
                    />
                    {errors.dateIn && (
                        <p className="text-sm text-red-500">{errors.dateIn.message}</p>
                    )}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="inHandsDate" className="flex gap-1">
                        In Hands Date <span className="text-red-500">*</span>
                    </Label>
                    <input 
                        id="inHandsDate" 
                        type="date" 
                        {...register('inHandsDate')} 
                        className={cn(
                            "flex h-10 w-full rounded-md border px-3",
                            errors.inHandsDate && "border-red-500"
                        )}
                        placeholder="Select date..." 
                    />
                    {errors.inHandsDate && (
                        <p className="text-sm text-red-500">{errors.inHandsDate.message}</p>
                    )}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="estimateNumber">Estimate Number</Label>
                    <Input 
                        id="estimateNumber" 
                        {...register('estimateNumber', {
                            setValueAs: v => v === '' ? null : v
                        })} 
                        placeholder="Enter estimate number..." 
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="purchaseOrderNumber">Purchase Order Number</Label>
                    <Input 
                        id="purchaseOrderNumber" 
                        {...register('purchaseOrderNumber', {
                            setValueAs: v => v === '' ? null : v
                        })} 
                        placeholder="Enter purchase order number..." 
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                    <Label htmlFor="workOrderNumber">Item Number</Label>
                    <Input 
                        id="workOrderNumber" 
                        {...register('workOrderNumber', {
                            setValueAs: v => v === '' ? null : v
                        })} 
                        placeholder="Enter item number..." 
                    />
                </div>
                <div className="flex flex-col space-y-1.5 mb-4">
                    <Label htmlFor="invoicePrintEmail" className="flex gap-1">
                        Invoice Type<span className="text-red-500">*</span>
                    </Label>
                    <CustomComboBox
                        options={[
                            { value: 'Print', label: 'Print' },
                            { value: 'Email', label: 'Email' },
                            { value: 'Both', label: 'Both' }
                        ]}
                        value={watch('invoicePrintEmail') ?? ""}
                        onValueChange={(value) => {
                            setValue('invoicePrintEmail', value as 'Print' | 'Email' | 'Both');
                            clearErrors('invoicePrintEmail');
                        }}
                        placeholder="Select type..."
                        emptyText="No type found."
                        searchPlaceholder="Search type..."
                        className={cn(
                            "w-[300px]",
                            errors.invoicePrintEmail && "border-red-500"
                        )}
                    />
                    {errors.invoicePrintEmail && (
                        <p className="text-sm text-red-500">{errors.invoicePrintEmail.message}</p>
                    )}
                </div>
                <div className="flex flex-col space-y-1.5 mb-4">
                    <Label htmlFor="status">Status</Label>
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
                <Button
                    type="submit"
                    className="px-[15px] py-[10px] rounded-[5px] text-[14px] font-normal text-center transition-colors bg-[#006739] text-white hover:bg-[#005730]"
                >
                    Submit and Next Step
                </Button>
            </form>
            <CopilotPopup
                instructions={`You are an AI assistant helping users create a new work order in a print portal system. You have access to:
                    1. The current form values and validation errors
                    2. Selected company and office information
                    3. Available companies, offices, and employees for selection
                    4. Loading states for various form sections

                    Your role is to:
                    - Guide users through the work order creation process
                    - Help users understand required fields and their purpose
                    - Explain validation errors and how to resolve them
                    - Assist with company, office, and contact person selection
                    - Provide guidance on dates, invoice types, and status options

                    When responding:
                    - Reference specific form fields and their current values
                    - Explain any validation errors in user-friendly terms
                    - Provide clear steps for completing required information
                    - Explain the implications of different choices (e.g., invoice types, status)
                    - Help users understand the workflow and next steps`}
                labels={{
                    title: "Work Order Creation Assistant",
                    initial: "How can I help you create your work order?",
                    placeholder: "Ask about fields, requirements, or next steps...",
                }}
            />
        </div>
    );
};

export default WorkOrderForm;