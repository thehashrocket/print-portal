"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { api } from "~/trpc/react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/app/_components/ui/command";
import { cn } from "~/lib/utils";
import debounce from "lodash/debounce";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showCompanyList, setShowCompanyList] = useState(false);
    const [offices, setOffices] = useState<Office[]>([]);

    const { data: companyData, isFetching: isLoadingCompanies } = api.companies.search.useQuery(
        { searchTerm },
        {
            enabled: searchTerm.length >= 3,
            staleTime: 5000,
        }
    );

    const companies = companyData ?? [];

    const { data: officeData, isLoading: isLoadingOffices } = api.offices.getByCompanyId.useQuery(
        selectedCompany || '', 
        { 
            enabled: !!selectedCompany,
            staleTime: 30000,
        }
    );

    useEffect(() => {
        if (officeData) {
            setOffices(officeData.map((office: { id: string; name: string }) => ({
                id: office.id,
                name: office.name
            })));
        }
    }, [officeData]);

    const debouncedSearch = useMemo(
        () => debounce((term: string) => {
            setSearchTerm(term);
            setIsSearching(true);
        }, 300),
        []
    );

    const handleCompanySearch = (value: string) => {
        if (value.length >= 3) {
            debouncedSearch(value);
        }
    };

    const handleCompanySelect = (companyId: string, companyName: string) => {
        setSelectedCompany(companyId);
        setSearchTerm(companyName);
        setShowCompanyList(false);
        setFormData(prev => ({
            ...prev,
            companyId: companyId,
            officeId: ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm(formData)) {
            await createUser.mutateAsync(formData);
        }
    };

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

    const handleClose = useCallback(() => {
        if (!isOpen) return; // Prevent unnecessary state updates
        setFormData({
            name: "",
            email: "",
            companyId: "",
            officeId: "",
        });
        setErrors({});
        setSelectedCompany(null);
        setSelectedOffice(null);
        onClose();
    }, [onClose, isOpen]);

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }));
                            }}
                            placeholder="Enter name"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }));
                            }}
                            placeholder="Enter email"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="company">Company</Label>
                        <div className="relative">
                            <Command className="rounded-lg border shadow-md">
                                <CommandInput
                                    placeholder="Search for a company..."
                                    value={searchTerm}
                                    onValueChange={(value) => {
                                        setSearchTerm(value);
                                        handleCompanySearch(value);
                                        if (value.length === 0) {
                                            setSelectedCompany(null);
                                            setFormData(prev => ({
                                                ...prev,
                                                companyId: '',
                                                officeId: ''
                                            }));
                                        }
                                        setShowCompanyList(true);
                                    }}
                                />
                                <CommandList className="max-h-[200px] overflow-y-auto">
                                    <CommandEmpty>
                                        {searchTerm.length < 3 ? (
                                            <p className="p-2 text-sm text-gray-500">
                                                Type at least 3 characters to search...
                                            </p>
                                        ) : isLoadingCompanies ? (
                                            <div className="flex items-center justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="ml-2">Searching...</span>
                                            </div>
                                        ) : (
                                            <p className="p-2 text-sm text-gray-500">
                                                No companies found
                                            </p>
                                        )}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {companies.map((company) => (
                                            <CommandItem
                                                key={company.id}
                                                value={company.name}
                                                onSelect={() => {
                                                    handleCompanySelect(company.id, company.name);
                                                    setShowCompanyList(false);
                                                }}
                                            >
                                                <span>{company.name}</span>
                                                {selectedCompany === company.id && (
                                                    <Check className="ml-2 h-4 w-4" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                        {errors.companyId && <p className="text-sm text-red-500">{errors.companyId}</p>}
                    </div>

                    {selectedCompany && (
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="office">Office</Label>
                            <Select
                                value={selectedOffice ?? ""}
                                onValueChange={(value: string) => {
                                    setSelectedOffice(value);
                                    setFormData(prev => ({
                                        ...prev,
                                        officeId: value
                                    }));
                                }}
                                disabled={isLoadingOffices}
                            >
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder={isLoadingOffices ? "Loading offices..." : "Select office..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingOffices ? (
                                        <div className="flex items-center justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="ml-2">Loading offices...</span>
                                        </div>
                                    ) : offices.length === 0 ? (
                                        <div className="p-2 text-center text-sm text-gray-500">
                                            No offices found
                                        </div>
                                    ) : (
                                        offices.map((office) => (
                                            <SelectItem key={office.id} value={office.id}>
                                                {office.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
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