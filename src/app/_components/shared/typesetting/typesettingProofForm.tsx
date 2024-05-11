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

const typesettingProofFormSchema = z.object({
    proofNumber: z.number().min(1, "Proof number must be greater than 0"),
    dateSubmitted: z.string(),
    approved: z.boolean(),
    notes: z.string().optional(),
});

type TypesettingProofFormData = z.infer<typeof typesettingProofFormSchema>;

export function TypesettingProofForm({ typesettingId, onSubmit, onCancel }: {
    typesettingId: string;
    onSubmit: (data: TypesettingProofFormData) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingProofFormData>({
        resolver: zodResolver(typesettingProofFormSchema),
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const createTypesettingProof = api.typesetting.createTypesettingProof.useMutation({
        onSuccess: () => {
            setIsLoading(false);
            setSuccess("Typesetting proof created successfully!");
            setError(null);
            // Clear the form
            reset();
        },
        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the typesetting proof.");
            setSuccess(null);
        },
    });

    const onSubmitHandler = (data: TypesettingProofFormData) => {
        createTypesettingProof.mutate({
            typesettingId: typesettingId,
            proofNumber: data.proofNumber,
            dateSubmitted: data.dateSubmitted,
            approved: data.approved,
            notes: data.notes || "",
        });
    };

    const cancel = () => {
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)}>
            <div>
                <label>Proof Number</label>
                <input type="number" {...register("proofNumber")} />
                {errors.proofNumber && <span>{errors.proofNumber.message}</span>}
            </div>
            <div>
                <label>Date Submitted</label>
                <input type="date" {...register("dateSubmitted")} />
                {errors.dateSubmitted && <span>{errors.dateSubmitted.message}</span>}
            </div>
            <div>
                <label>Approved</label>
                <input type="checkbox" {...register("approved")} />
                {errors.approved && <span>{errors.approved.message}</span>}
            </div>
            <div>
                <label>Notes</label>
                <textarea {...register("notes")} />
                {errors.notes && <span>{errors.notes.message}</span>}
            </div>
            <div>
                <button type="submit" disabled={isLoading}>Submit</button>
                <button type="button" onClick={cancel}>Cancel</button>
            </div>
            {error && <div>{error}</div>}
            {success && <div>{success}</div>}
        </form>
    );
}
export default TypesettingProofForm;
