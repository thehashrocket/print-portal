"use client";
// Transfer Ownership Component
// This component is used to transfer the ownership of an order to another user
// It is used in the OrderDetailsComponent

// It has a form with a dropdown to choose a company from the list of companies the user has access to.
// It has a dropdown to choose an office from the list of offices in the company.
// It has a dropdown to choose a user from the list of users in the office.
// It has a button to transfer the ownership of the order to the selected user.
// It has a ShippingInfoEditor component to edit the shipping information of the order.
// It has a button to transfer the ownership of the order to the selected user.
// It has a button to cancel the transfer.

import { DialogTrigger } from '@radix-ui/react-dialog';
import React, { useEffect, useMemo } from 'react';
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/app/_components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';
import { Label } from '~/app/_components/ui/label';
import { Loader2 } from 'lucide-react';
import { api } from '~/trpc/react';
import { CustomComboBox } from '../../shared/ui/CustomComboBox';
import { useState } from 'react';
import { debounce } from 'lodash';
import { CreateContactModal } from '../../shared/contacts/createContactModal';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from "~/lib/utils";
import { PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TransferOwnershipProps {
    orderId: string;
}

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

const transferOwnershipSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    officeId: z.string().min(1, 'Office is required'),
    contactPersonId: z.string().min(1, 'Contact person is required'),
});

type TransferOwnershipFormData = z.infer<typeof transferOwnershipSchema>;

const TransferOwnership: React.FC<TransferOwnershipProps> = ({ orderId }) => {
    const { handleSubmit, formState: { errors }, setValue, watch, clearErrors } = useForm<TransferOwnershipFormData>({
        resolver: zodResolver(transferOwnershipSchema)
    });
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [isCreateContactModalOpen, setIsCreateContactModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offices, setOffices] = useState<Office[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
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
    const utils = api.useUtils();
    const transferOwnershipMutation = api.orders.transferOwnership.useMutation({
        onSuccess: () => {
            setIsSubmitting(false);
            toast.success('Ownership transferred successfully');
            // Invalidate the order query to refresh the data
            utils.orders.getByID.invalidate(orderId);
        },
        onError: (error) => {
            setIsSubmitting(false);
            toast.error(error.message || 'Failed to transfer ownership');
        }
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

    const handleFormSubmit = handleSubmit(async (data) => {
        try {
            setIsSubmitting(true);
            await transferOwnershipMutation.mutateAsync({
                orderId: orderId,
                companyId: data.companyId,
                officeId: data.officeId,
                contactPersonId: data.contactPersonId
            });
            toast.success('Ownership transferred successfully. You will need to update the shipping information!');
        } catch (error) {
            console.error('Error transferring ownership:', error);
            toast.error('Failed to transfer ownership');
        }
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                >Transfer Ownership</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Ownership</DialogTitle>
                </DialogHeader>
                {/* Company Section */}
                <div className="grid gap-4 py-4">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                            <CustomComboBox
                                options={companies.map(company => ({
                                    value: company.id,
                                    label: company.name ?? 'Unnamed Company'
                                }))}
                                value={selectedCompany ?? ""}
                                onValueChange={(value) => {
                                    setSelectedCompany(value);
                                    setValue('companyId', value);
                                    clearErrors('companyId');
                                }}
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
                            {errors.companyId && (
                                <p className="text-sm text-red-500">{errors.companyId.message}</p>
                            )}
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
                                {errors.officeId && (
                                    <p className="text-sm text-red-500">{errors.officeId.message}</p>
                                )}
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
                        <div className="flex flex-row gap-2">
                        <Button 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Transfer Ownership"
                                )}
                            </Button>
                            <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSelectedCompany(null);
                                setSelectedOffice(null);
                                setValue('companyId', '');
                                setValue('officeId', '');
                                setValue('contactPersonId', '');
                            }}
                            >
                                Reset
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setIsSubmitting(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>


            </DialogContent>
        </Dialog>
    )
};

export default TransferOwnership;
