"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation'
import { type SerializedOffice } from '~/types/serializedTypes';
import { CustomComboBox } from '~/app/_components/shared/ui/CustomComboBox';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { cn } from "~/lib/utils";
import { PlusCircle, Loader2 } from "lucide-react";
import { CreateContactModal } from '~/app/_components/shared/contacts/createContactModal';
import debounce from "lodash/debounce";

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
    isWalkIn: z.boolean().default(false),
    walkInCustomerName: z.string().optional(),
    walkInCustomerEmail: z.string().email().optional().nullable(),
    walkInCustomerPhone: z.string().optional().nullable(),
    walkInCustomerId: z.string().optional().nullable(),
}).refine((data) => {
    // If it's a walk-in customer, require the name
    if (data.isWalkIn) {
        return !!data.walkInCustomerName;
    }
    return true;
}, {
    message: "Customer name is required for walk-in customers",
    path: ["walkInCustomerName"],
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
        resolver: zodResolver(workOrderSchema) as any,
        defaultValues: {
            isWalkIn: false,
            status: 'Draft',
            invoicePrintEmail: 'Print',
        }
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
    const createWorkOrderMutation = api.workOrders.createWorkOrder.useMutation({
        onSuccess: (createdWorkOrder) => {
            router.push(`/workOrders/create/${createdWorkOrder.id}`);
        },
    });
    const createWalkInCustomerMutation = api.walkInCustomers.create.useMutation({
        onSuccess: async (customer, _variables, _context) => {
            if (newWorkOrderData) {
                const workOrderData = {
                    ...newWorkOrderData,
                    walkInCustomerId: customer.id,
                };
                await createWorkOrderMutation.mutateAsync(workOrderData);
            }
        },
    });
    const router = useRouter();
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWalkIn, setIsWalkIn] = useState(false);
    const [newWorkOrderData, setNewWorkOrderData] = useState<any>(null);
    const [walkInOffice, setWalkInOffice] = useState<SerializedOffice | null>(null);
    // walk-in office data should be of type SerializedOffice
    const { data: walkInOfficeData } = api.offices.getWalkInOffice.useQuery(undefined, {
        retry: 3,
        staleTime: 0,
        refetchOnMount: true
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

    useEffect(() => {
        if (walkInOfficeData) {
            console.log('Walk-in office data:', walkInOfficeData);
            setWalkInOffice(walkInOfficeData);
        }
    }, [walkInOfficeData]);

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

    const handleFormSubmit = handleSubmit(async (data) => {
        try {
            setIsSubmitting(true);
            console.log('Form data:', data);
            
            const officeId = isWalkIn 
                ? walkInOfficeData?.id 
                : selectedOffice;

            if (!officeId) {
                console.error('No office ID available');
                if (isWalkIn) {
                    console.error('Walk-in office not found. Please ensure the walk-in office is properly configured.');
                }
                return;
            }

            const workOrderData = {
                officeId,
                dateIn: data.dateIn ? new Date(data.dateIn + 'T12:00:00') : new Date(),
                inHandsDate: data.inHandsDate ? new Date(data.inHandsDate + 'T12:00:00') : new Date(),
                isWalkIn,
                status: data.status,
                invoicePrintEmail: data.invoicePrintEmail,
                estimateNumber: data.estimateNumber || undefined,
                purchaseOrderNumber: data.purchaseOrderNumber || undefined,
                workOrderNumber: data.workOrderNumber || undefined,
                contactPersonId: data.contactPersonId || undefined,
            };

            console.log('Work order data:', workOrderData); // Add this for debugging

            setNewWorkOrderData(workOrderData);

            if (isWalkIn && data.walkInCustomerName) {
                console.log('Creating walk-in customer...'); // Add this for debugging
                // Create walk-in customer first
                await createWalkInCustomerMutation.mutateAsync({
                    name: data.walkInCustomerName,
                    email: data.walkInCustomerEmail || undefined,
                    phone: data.walkInCustomerPhone || undefined,
                });
            } else {
                console.log('Creating regular work order...'); // Add this for debugging
                await createWorkOrderMutation.mutateAsync(workOrderData);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <div className="space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Walk-in Customer Toggle */}
                <div className="flex items-center space-x-2">
                    <Label htmlFor="isWalkIn">Walk-in Customer</Label>
                    <input
                        type="checkbox"
                        id="isWalkIn"
                        checked={isWalkIn}
                        onChange={(e) => {
                            const isChecked = e.target.checked;
                            setIsWalkIn(isChecked);
                            setValue('isWalkIn', isChecked);
                            if (isChecked) {
                                setSelectedCompany(null);
                                setSelectedOffice(null);
                                // Set the walk-in office ID if available
                                if (walkInOffice?.id) {
                                    setValue('officeId', walkInOffice.id);
                                } else {
                                    console.error('Walk-in office not found');
                                }
                            } else {
                                setValue('walkInCustomerName', undefined);
                                setValue('walkInCustomerEmail', undefined);
                                setValue('walkInCustomerPhone', undefined);
                                setValue('officeId', '');
                            }
                            // Clear any existing errors
                            clearErrors();
                        }}
                        className="form-checkbox h-4 w-4 text-[#006739] transition duration-150 ease-in-out"
                    />
                </div>

                {/* Walk-in Customer Fields */}
                {isWalkIn && (
                    <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="walkInCustomerName">Customer Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="walkInCustomerName"
                                {...register('walkInCustomerName', { required: isWalkIn })}
                                placeholder="Enter customer name..."
                            />
                            {errors.walkInCustomerName && (
                                <p className="text-sm text-red-500">{errors.walkInCustomerName.message}</p>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="walkInCustomerEmail">Customer Email</Label>
                            <Input
                                id="walkInCustomerEmail"
                                type="email"
                                {...register('walkInCustomerEmail')}
                                placeholder="Enter customer email..."
                            />
                            {errors.walkInCustomerEmail && (
                                <p className="text-sm text-red-500">{errors.walkInCustomerEmail.message}</p>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="walkInCustomerPhone">Customer Phone</Label>
                            <Input
                                id="walkInCustomerPhone"
                                {...register('walkInCustomerPhone')}
                                placeholder="Enter customer phone..."
                            />
                            {errors.walkInCustomerPhone && (
                                <p className="text-sm text-red-500">{errors.walkInCustomerPhone.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Existing Company/Office Selection - Only show if not walk-in */}
                {!isWalkIn && (
                    <>
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
                    </>
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit and Next Step"
                    )}
                </Button>
            </form>
        </div>
    );
};

export default WorkOrderForm;
