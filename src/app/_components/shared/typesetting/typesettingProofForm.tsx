// A React Form component that uses the useForm hook from react-hook-form to manage form state and validation.
// The form is used to create a new TypesettingProof.
// The form is created using the zod library to define the shape of the form data and validate it.
// The form data is passed to the createTypesettingProof mutation function to create a new TypesettingProof.
// The form also displays success and error messages based on the result of the mutation.
// The form is reset after a successful submission.
// The form also includes a cancel button to cancel the form submission.
// The form is used in the TypesettingComponent.

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { TypesettingProof } from "@prisma/client";

const typesettingProofFormSchema = z.object({
    proofNumber: z.number().min(1, "Proof number must be greater than 0"),
    dateSubmitted: z.string(),
    approved: z.boolean(),
    notes: z.string().optional(),
});

type TypesettingProofFormData = z.infer<typeof typesettingProofFormSchema>;

export function TypesettingProofForm({ typesettingId, onSubmit, onCancel }: {
    typesettingId: string;
    onSubmit: (data: TypesettingProof) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingProofFormData>({
        resolver: zodResolver(typesettingProofFormSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const createTypesettingProof = api.typesettingProofs.create.useMutation({
        onSuccess: (createdTypesettingProof) => {
            setIsLoading(false);
            setSuccess("Typesetting proof created successfully!");
            setError(null);
            // Clear the form
            reset();
            // Pass the created typesetting proof to the parent component
            onSubmit(createdTypesettingProof);
        },
        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the typesetting proof.");
            setSuccess(null);
        },
    });
    const onSubmitHandler = (data: TypesettingProofFormData) => {
        // receives typesettingId from props, rest of the data from the form
        setIsLoading(true);
        createTypesettingProof.mutate({
            typesettingId,
            ...data,
            dateSubmitted: new Date(data.dateSubmitted).toISOString(),
        });

    };

    const cancel = () => {
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className="max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Proof Number</label>
                <input
                    type="number"
                    {...register("proofNumber", { valueAsNumber: true })}
                    className="input input-bordered w-full"
                />
                {errors.proofNumber && (
                    <span className="text-red-500">{errors.proofNumber.message}</span>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Date Submitted</label>
                <input
                    type="date"
                    {...register("dateSubmitted")}
                    className="input input-bordered w-full"
                />
                {errors.dateSubmitted && (
                    <span className="text-red-500">{errors.dateSubmitted.message}</span>
                )}
            </div>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        {...register("approved")}
                        className="checkbox checkbox-primary"
                    />
                    <span className="ml-2 text-gray-700 font-bold">Approved</span>
                </label>
                {errors.approved && (
                    <span className="text-red-500">{errors.approved.message}</span>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Notes</label>
                <textarea
                    {...register("notes")}
                    className="textarea textarea-bordered w-full"
                />
                {errors.notes && (
                    <span className="text-red-500">{errors.notes.message}</span>
                )}
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary mr-2"
                >
                    Submit
                </button>
                <button type="button" onClick={cancel} className="btn btn-outline">
                    Cancel
                </button>
            </div>
            {error && <div className="alert alert-error mt-4">{error}</div>}
            {success && <div className="alert alert-success mt-4">{success}</div>}
        </form>
    );
}
export default TypesettingProofForm;
