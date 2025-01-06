"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CustomComboBox } from "~/app/_components/shared/ui/CustomComboBox";
import { api } from "~/trpc/react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import { Loader2 } from "lucide-react";

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    companyId: z.string().min(1, "Company is required"),
    officeId: z.string().min(1, "Office is required"),
});

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Company {
    id: string;
    name: string;
}

interface Office {
    id: string;
    name: string;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        companyId: "",
        officeId: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
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
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingOffices, setIsLoadingOffices] = useState(false);

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

    const createUser = api.userManagement.createUser.useMutation({
        onSuccess: () => {
            toast.success("User created successfully");
            onSuccess();
            handleClose();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const validateForm = useMemo(() => {
        return (data: typeof formData) => {
            try {
                createUserSchema.parse(data);
                setErrors({});
                return true;
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const fieldErrors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                        if (err.path && err.path.length > 0) {
                            const path = err.path[0];
                            if (typeof path === 'string') {
                                fieldErrors[path] = err.message;
                            }
                        }
                    });
                    setErrors(fieldErrors);
                }
                return false;
            }
        };
    }, []);

    const debouncedSetFormData = useMemo(
        () => debounce((field: string, value: string) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        }, 100),
        []
    );

    const handleInputChange = useCallback((field: string, value: string) => {
        debouncedSetFormData(field, value);
    }, [debouncedSetFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm(formData)) {
            await createUser.mutateAsync(formData);
        }
    };

    const handleClose = useCallback(() => {
        setFormData({
            name: "",
            email: "",
            companyId: "",
            officeId: "",
        });
        setErrors({});
        onClose();
    }, [onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            defaultValue=""
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter name"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            defaultValue=""
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter email"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="company">Company</Label>
                        <div className="relative">
                            <CustomComboBox
                                options={companies.map(company => ({
                                    value: company.id,
                                    label: company.name ?? 'Unnamed Company'
                                }))}
                                value={selectedCompany ?? ""}
                                onValueChange={(value) => {
                                    setSelectedCompany(value);
                                    setSelectedOffice(null);
                                    setFormData(prev => ({
                                        ...prev,
                                        companyId: value,
                                        officeId: ''
                                    }));
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
                        </div>
                        {errors.companyId && <p className="text-sm text-red-500">{errors.companyId}</p>}
                    </div>

                    {selectedCompany && (
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="office">Office</Label>
                            <CustomComboBox
                                options={offices.map(office => ({
                                    value: office.id,
                                    label: office.name ?? 'Unnamed Office'
                                }))}
                                value={selectedOffice ?? ""}
                                onValueChange={(value) => {
                                    setSelectedOffice(value);
                                    setFormData(prev => ({
                                        ...prev,
                                        officeId: value
                                    }));
                                }}
                                placeholder={isLoadingOffices ? "Loading..." : "Select office..."}
                                emptyText="No office found."
                                searchPlaceholder="Search office..."
                                className="w-[300px]"
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 