"use client"
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { TypesettingOption } from "@prisma/client";
import { useTypesettingContext } from "~/app/contexts/TypesettingContext";

const typesettingOptionsSchema = z.object({
    option: z.string(),
    description: z.string(),
});

type TypesettingOptionsFormData = z.infer<typeof typesettingOptionsSchema>;

export function TypesettingOptionsComponent({ typesettingId, onSubmit, onCancel }: {
    typesettingId: string;
    onSubmit: (data: TypesettingOption) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingOptionsFormData>({
        resolver: zodResolver(typesettingOptionsSchema),
    });

    const { typesetting, setTypesetting } = useTypesettingContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const createTypesettingOption = api.typesettingOptions.create.useMutation({
        onSuccess: (createdTypesettingOption) => {
            setIsLoading(false);
            setSuccess("Typesetting option created successfully!");
            setError(null);
            // Clear the form
            reset();
            // Pass the created typesetting option to the parent component
            onSubmit(createdTypesettingOption);
            // Update the context state
            setTypesetting((prevTypesetting) =>
                prevTypesetting.map((type) =>
                    type.id === typesettingId
                        ? { ...type, TypesettingOptions: [...type.TypesettingOptions, createdTypesettingOption] }
                        : type
                )
            );
        },

        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the typesetting option.");
            setSuccess(null);
        },
    });

    const onSubmitHandler = (data: TypesettingOptionsFormData) => {
        // receives typesettingId from props, rest of the data from the form
        setIsLoading(true);
        createTypesettingOption.mutate({ ...data, typesettingId });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)}>
            <div className="form-group">
                <label htmlFor="option">Option</label>
                <input
                    type="text"
                    id="option"
                    className="form-control"
                    {...register("option")}
                />
                {errors.option && <span>{errors.option.message}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    id="description"
                    className="form-control"
                    {...register("description")}
                />
                {errors.description && <span>{errors.description.message}</span>}
            </div>
            <div className="form-group">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </form>
    );
}

// Path: src/app/_components/shared/typesetting/typesettingOptionsComponent.tsx
// Compare this snippet from src/app/_components/shared/typesetting/typesettingProofForm.tsx:
export default TypesettingOptionsComponent;