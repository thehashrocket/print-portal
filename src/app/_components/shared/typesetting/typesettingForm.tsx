"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { Typesetting, TypesettingStatus } from "@prisma/client";

// Define the schema using Zod
const typesettingFormSchema = z.object({
    id: z.string().optional(),
    dateIn: z.date(),
    cost: z.number().optional().nullable(),
    timeIn: z.string(),
    plateRan: z.string().optional().nullable(),
    prepTime: z.number().min(0, "Prep time must be greater than or equal to 0").nullable(),
    approved: z.boolean(),
    status: z.nativeEnum(TypesettingStatus),
    followUpNotes: z.string().optional().nullable(),
    orderItemId: z.string().nullable(),
    workOrderItemId: z.string().nullable(),
});

type TypesettingFormData = z.infer<typeof typesettingFormSchema>;

interface TypesettingFormProps {
    typesetting?: Typesetting | null;
    orderItemId: string;
    workOrderItemId: string;
    onSubmit: () => void;
    onCancel: () => void;
}

// Factory function to create a complete Typesetting object
function createDefaultTypesetting(overrides: Partial<Typesetting> = {}): Typesetting {
    return {
        id: '', // Default or generated ID
        dateIn: new Date(),
        cost: null,
        timeIn: '',
        plateRan: null,
        prepTime: null,
        approved: false,
        status: TypesettingStatus.InProgress,
        followUpNotes: null,
        orderItemId: null,
        workOrderItemId: null,
        createdById: '', // Replace with actual user ID if needed
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides, // Apply any overrides
    };
}

export function TypesettingForm({ typesetting, orderItemId, workOrderItemId, onSubmit, onCancel }: TypesettingFormProps) {
    const isAddMode = !typesetting;
    const completeTypesetting = typesetting ? typesetting : createDefaultTypesetting({ orderItemId, workOrderItemId });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingFormData>({
        defaultValues: typesetting ? {
            ...typesetting,
            cost: typesetting.cost ? Number(typesetting.cost.toFixed(2)) : null, // Convert Decimal to number
        } : {},
    });

    const updateTypesetting = api.typesettings.update.useMutation({
        onSuccess: (updatedTypesetting) => {
            setSuccess("Typesetting updated successfully");
            onSubmit();
        },
        onError: (error) => {
            setError("Error updating typesetting");
            console.error("Error updating typesetting:", error);
        },
    });

    const createTypesetting = api.typesettings.create.useMutation({
        onSuccess: (newTypesetting) => {
            setSuccess("Typesetting created successfully");
            onSubmit();
        },
        onError: (error) => {
            setError("Error creating typesetting");
            console.error("Error creating typesetting:", error);
        },
    });

    useEffect(() => {
        if (typesetting) {
            reset({
                ...typesetting,
                cost: typesetting.cost ? Number(typesetting.cost.toFixed(2)) : null,
            });
        } else {
            reset();
        }
    }, [typesetting, reset]);

    const submit = handleSubmit((data) => {
        const formattedData = {
            ...data,
            cost: data.cost ?? 0, // Ensure cost is correctly handled
            followUpNotes: data.followUpNotes || '', // Ensure followUpNotes is nullable
        };

        if (isAddMode) {
            createTypesetting.mutate(formattedData);
        } else {
            const updateData = {
                ...formattedData,
                id: data.id || '',  // Ensure `id` is always defined
            };

            updateTypesetting.mutate(updateData);
        }
    });

    return (
        <form onSubmit={submit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="toast toast-top toast-end">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
            </div>
            <div className="grid grid-cols-1 gap-6 mb-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Date In</span>
                    </label>
                    <input
                        type="date"
                        className="input input-bordered"
                        {...register("dateIn", {
                            valueAsDate: true,
                            required: "Date In is required"
                        })}
                    />
                    {errors.dateIn && <span className="text-error">{errors.dateIn.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Time In</span>
                    </label>
                    <input type="time" className="input input-bordered" {...register("timeIn")} />
                    {errors.timeIn && <span className="text-error">{errors.timeIn.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Plate Ran</span>
                    </label>
                    <input type="text" className="input input-bordered" {...register("plateRan")} />
                    {errors.plateRan && <span className="text-error">{errors.plateRan.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Prep Time</span>
                    </label>
                    <input type="number" className="input input-bordered" {...register("prepTime", { valueAsNumber: true })} />
                    {errors.prepTime && <span className="text-error">{errors.prepTime.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Approved</span>
                    </label>
                    <input type="checkbox" className="checkbox" {...register("approved")} />
                    {errors.approved && <span className="text-error">{errors.approved.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Cost</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered"
                        {...register("cost", { valueAsNumber: true })}
                    />
                    {errors.cost && <span className="text-error">{errors.cost.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Status</span>
                    </label>
                    <select className="select select-bordered" {...register("status")}>
                        {Object.values(TypesettingStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    {errors.status && <span className="text-error">{errors.status.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Follow Up Notes</span>
                    </label>
                    <textarea className="textarea textarea-bordered" {...register("followUpNotes")} />
                    {errors.followUpNotes && <span className="text-error">{errors.followUpNotes.message}</span>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default TypesettingForm;
