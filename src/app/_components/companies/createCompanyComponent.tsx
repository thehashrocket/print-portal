// Create a company component
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";

const companyFormSchema = z.object({
    name: z.string().min(1, "Required"),
    officeName: z.string().min(1, "Required"),
    line1: z.string().min(1, "Required"),
    line2: z.string().optional(),
    city: z.string().min(1, "Required"),
    state: z.string().min(2, "Required"),
    zipCode: z.string().min(5, "Required"),
    country: z.string().min(2, "Required"),
    telephoneNumber: z.string().min(10, "Required"),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

export function CreateCompany() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CompanyFormData>({
        resolver: zodResolver(companyFormSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const createCompany = api.companies.create.useMutation({
        onSuccess: () => {
            setIsLoading(false);
            setSuccess("Company created successfully!");
            setError(null);
            // Clear the form
            reset();

        },
        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the company.");
            setSuccess(null);
        },
    });

    const onSubmit = (data: CompanyFormData) => {
        createCompany.mutate({
            name: data.name,
            Offices: [{
                name: data.officeName,
                Addresses: [{
                    line1: data.line1,
                    line2: data.line2 || "",
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    country: data.country,
                    telephoneNumber: data.telephoneNumber,
                }],
            }],
        });
    };

    return (
        <>
            <div className="toast toast-top toast-end">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h1 className="card-title">Create a new company</h1>
                            <form onSubmit={handleSubmit(onSubmit)} className="form-control">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Company Name</span>
                                    </label>
                                    <input type="text" {...register("name")} className="input input-bordered" />
                                    {errors.name && <span className="text-error">{errors.name.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Office Name</span>
                                    </label>
                                    <input type="text" {...register("officeName")} className="input input-bordered" />
                                    {errors.officeName && <span className="text-error">{errors.officeName.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Address Line 1</span>
                                    </label>
                                    <input type="text" {...register("line1")} className="input input-bordered" />
                                    {errors.line1 && <span className="text-error">{errors.line1.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Address Line 2</span>
                                    </label>
                                    <input type="text" {...register("line2")} className="input input-bordered" />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">City</span>
                                    </label>
                                    <input type="text" {...register("city")} className="input input-bordered" />
                                    {errors.city && <span className="text-error">{errors.city.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">State</span>
                                    </label>
                                    <input type="text" {...register("state")} className="input input-bordered" />
                                    {errors.state && <span className="text-error">{errors.state.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Zip Code</span>
                                    </label>
                                    <input type="text" {...register("zipCode")} className="input input-bordered" />
                                    {errors.zipCode && <span className="text-error">{errors.zipCode.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Country</span>
                                    </label>
                                    <input type="text" {...register("country")} className="input input-bordered" />
                                    {errors.country && <span className="text-error">{errors.country.message}</span>}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Telephone Number</span>
                                    </label>
                                    <input type="tel" {...register("telephoneNumber")} className="input input-bordered" />
                                    {errors.telephoneNumber && <span className="text-error">{errors.telephoneNumber.message}</span>}
                                </div>

                                <div className="form-control mt-6">
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Company"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateCompany;