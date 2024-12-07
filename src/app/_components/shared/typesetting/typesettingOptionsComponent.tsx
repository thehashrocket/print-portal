"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { useTypesettingContext } from '~/app/contexts/TypesettingContext';
import { type SerializedTypesettingOption } from '~/types/serializedTypes';
import { normalizeTypesettingOption } from '~/utils/dataNormalization';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';

const typesettingOptionsSchema = z.object({
    option: z.string(),
    description: z.string(),
});

type TypesettingOptionsFormData = z.infer<typeof typesettingOptionsSchema>;

export function TypesettingOptionsComponent({ typesettingId, onSubmit, onCancel }: {
    typesettingId: string;
    onSubmit: (data: SerializedTypesettingOption) => void;
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
            reset();

            const serializedOption = normalizeTypesettingOption(createdTypesettingOption);
            onSubmit(serializedOption);

            // Update the typesetting state with serialized data
            const updatedTypesetting = typesetting.map((type) =>
                type.id === typesettingId
                    ? { ...type, TypesettingOptions: [...type.TypesettingOptions, serializedOption] }
                    : type
            );
            setTypesetting(updatedTypesetting);
        },
        onError: () => {
            setIsLoading(false);
            setError("An error occurred while creating the typesetting option.");
            setSuccess(null);
        },
    });

    const onSubmitHandler = (data: TypesettingOptionsFormData) => {
        setIsLoading(true);
        createTypesettingOption.mutate({ ...data, typesettingId, selected: false });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)}>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="option">Option</Label>
                <Input
                    type="text"
                    id="option"
                    className="form-control"
                    {...register("option")}
                />
                {errors.option && <span>{errors.option.message}</span>}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="description">Description</Label>
                <Input
                    type="text"
                    id="description"
                    className="form-control"
                    {...register("description")}
                />
                {errors.description && <span>{errors.description.message}</span>}
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Button
                    variant="default"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating..." : "Create"}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </form>
    );
}