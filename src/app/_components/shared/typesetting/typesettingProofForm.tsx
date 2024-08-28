"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { ProofMethod } from "@prisma/client";
import { useTypesettingContext } from "~/app/contexts/TypesettingContext";
import { SerializedTypesettingProof } from "~/types/serializedTypes";
import { normalizeTypesettingProof } from "~/utils/dataNormalization";

const typesettingProofFormSchema = z.object({
    proofNumber: z.number().min(1, "Proof number must be greater than 0"),
    dateSubmitted: z.string(),
    approved: z.boolean(),
    notes: z.string().optional(),
    proofCount: z.number().default(0),
    proofMethod: z.nativeEnum(ProofMethod).default("Digital"),
});

type TypesettingProofFormData = z.infer<typeof typesettingProofFormSchema>;

export function TypesettingProofForm({ typesettingId, onSubmit, onCancel }: {
    typesettingId: string;
    onSubmit: (data: SerializedTypesettingProof) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingProofFormData>({
        resolver: zodResolver(typesettingProofFormSchema),
    });

    const { typesetting, setTypesetting } = useTypesettingContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const createTypesettingProof = api.typesettingProofs.create.useMutation({
        onSuccess: (createdTypesettingProof) => {
            setIsLoading(false);
            setSuccess("Typesetting proof created successfully!");
            setError(null);
            reset();

            const serializedProof = normalizeTypesettingProof(createdTypesettingProof);
            onSubmit(serializedProof);

            // Update the context state with serialized data
            const updatedTypesetting = typesetting.map((type) =>
                type.id === typesettingId
                    ? { ...type, TypesettingProofs: [...type.TypesettingProofs, serializedProof] }
                    : type
            );
            setTypesetting(updatedTypesetting);
        },
        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the typesetting proof.");
            setSuccess(null);
        },
    });

    const onSubmitHandler = (data: TypesettingProofFormData) => {
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
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Proof Method</label>
                <select {...register("proofMethod")} className="select select-bordered w-full">
                    {Object.values(ProofMethod).map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
                {errors.proofMethod && (
                    <span className="text-red-500">{errors.proofMethod.message}</span>
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
                <button type="button" onClick={cancel} className="btn btn-ghost">
                    Cancel
                </button>
            </div>
            {error && <div className="alert alert-error mt-4">{error}</div>}
            {success && <div className="alert alert-success mt-4">{success}</div>}
        </form>
    );
}

export default TypesettingProofForm;