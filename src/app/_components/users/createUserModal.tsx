"use client";

import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { api } from "~/trpc/react";
import { z } from "zod";
import { toast } from "react-hot-toast";
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

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "",
    officeId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: companies } = api.companies.getAll.useQuery();
  const { data: offices } = api.offices.getByCompanyId.useQuery(
    formData.companyId,
    { enabled: !!formData.companyId }
  );

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

  const debouncedSetFormData = useCallback(
    debounce((field: string, value: string) => {
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

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => handleInputChange('companyId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && <p className="text-sm text-red-500">{errors.companyId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="office">Office</Label>
            <Select
              value={formData.officeId}
              onValueChange={(value) => handleInputChange('officeId', value)}
              disabled={!formData.companyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                {offices?.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.officeId && <p className="text-sm text-red-500">{errors.officeId}</p>}
          </div>

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