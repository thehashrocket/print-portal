"use client";
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { ProofMethod } from "@prisma/client";
import { useTypesettingContext } from "~/app/contexts/TypesettingContext";
import { type SerializedTypesettingProof } from "~/types/serializedTypes";
import { normalizeTypesettingProof } from "~/utils/dataNormalization";
import FileUpload from "../fileUpload";
import ArtworkComponent from "../artworkComponent/artworkComponent";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { SelectField } from "../../shared/ui/SelectField/SelectField";

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
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<TypesettingProofFormData>({
        resolver: zodResolver(typesettingProofFormSchema) as any,
        defaultValues: {
            proofCount: 0,
            proofMethod: ProofMethod.Digital,
            approved: false,
            dateSubmitted: new Date().toISOString().split('T')[0],
        }
    });
    const [artworks, setArtworks] = useState<{ fileUrl: string; description: string }[]>([]);
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

    const onSubmitHandler: SubmitHandler<TypesettingProofFormData> = (data) => {
        setIsLoading(true);
        createTypesettingProof.mutate({
            typesettingId,
            ...data,
            dateSubmitted: new Date(data.dateSubmitted).toISOString(),
            artwork: artworks
        });
    };

    const handleFileUploaded = (fileUrl: string, description: string) => {
        setArtworks(prev => [...prev, { fileUrl, description }]);
    };

    const handleFileRemoved = (fileUrl: string) => {
        setArtworks(prev => prev.filter(art => art.fileUrl !== fileUrl));
    };

    const handleDescriptionChanged = (fileUrl: string, newDescription: string) => {
        setArtworks(prev => prev.map(art =>
            art.fileUrl === fileUrl ? { ...art, description: newDescription } : art
        ));
    };

    const cancel = () => {
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className="max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Create Typesetting Proof</h2>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="proofNumber">Proof Number</Label>
                <Input
                    type="number"
                    {...register("proofNumber", { valueAsNumber: true })}
                    className="input input-bordered w-full"
                />
                {errors.proofNumber && (
                    <span className="text-red-500">{errors.proofNumber.message}</span>
                )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="artwork">Artwork</Label>
                <div className="grid grid-cols-2 gap-4">
                    {artworks.map((artwork, index) => (
                        <ArtworkComponent
                            key={index}
                            artworkUrl={artwork.fileUrl}
                            artworkDescription={artwork.description}
                        />
                    ))}
                </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="proofCount">Proof Count</Label>
                <FileUpload
                    onFileUploaded={handleFileUploaded}
                    onFileRemoved={handleFileRemoved}
                    onDescriptionChanged={handleDescriptionChanged}
                    workOrderItemId={typesettingId}
                    initialFiles={artworks}
                />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="dateSubmitted">Date Submitted</Label>
                <input
                    type="date"
                    {...register("dateSubmitted")}
                    className="input input-bordered w-full"
                />
                {errors.dateSubmitted && (
                    <span className="text-red-500">{errors.dateSubmitted.message}</span>
                )}
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <input type="checkbox" id="approved" {...register("approved")} />
                {errors.approved && (
                    <span className="text-red-500">{errors.approved.message}</span>
                )}
                <Label
                    htmlFor="approved"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Approved
                </Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    {...register("notes")}
                    className="textarea textarea-bordered w-full"
                />
                {errors.notes && (
                    <span className="text-red-500">{errors.notes.message}</span>
                )}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="proofMethod">Proof Method</Label>
                <SelectField
                    options={Object.values(ProofMethod).map((method) => ({ value: method, label: method }))}
                    value={watch('proofMethod')}
                    onValueChange={(value: string) => setValue("proofMethod", value as ProofMethod)}
                    placeholder="Select proof method..."
                    required={true}
                />
                {errors.proofMethod && (
                    <span className="text-red-500">{errors.proofMethod.message}</span>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    variant="default"
                    type="submit"
                    disabled={isLoading}
                >
                    Submit
                </Button>
                <Button
                    variant="outline"
                    onClick={cancel}
                >
                    Cancel
                </Button>
            </div>
            {error && <div className="alert alert-error mt-4">{error}</div>}
            {success && <div className="alert alert-success mt-4">{success}</div>}
        </form>
    );
}

export default TypesettingProofForm;