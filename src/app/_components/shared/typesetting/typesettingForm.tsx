"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TypesettingWithRelations } from "~/app/contexts/TypesettingContext"; // Import TypesettingWithRelations from context
import { api } from "~/trpc/react";
import { useTypesettingContext } from "~/app/contexts/TypesettingContext";

const typesettingFormSchema = z.object({
    id: z.string().optional(),
    dateIn: z.string(),
    plateRan: z.string(),
    prepTime: z.number().min(0, "Prep time must be greater than or equal to 0"),
    approved: z.boolean(),
    timeIn: z.string(),
    orderItemId: z.string().optional(),
    workOrderItemId: z.string().optional(),
    cost: z.string().optional(),
    typesettingOptions: z.array(z.any()).default([]),
    typesettingProofs: z.array(z.any()).default([]),
});

type TypesettingFormData = z.infer<typeof typesettingFormSchema>;

export function TypesettingForm({ typesetting, workOrderItemId, orderItemId, onSubmit, onCancel }: {
    typesetting?: TypesettingWithRelations | null;
    orderItemId: string;
    workOrderItemId: string;
    onSubmit: () => void;
    onCancel: () => void;
}) {
    const isAddMode = !typesetting;
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { setTypesetting } = useTypesettingContext();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingFormSchema),
        defaultValues: typesetting ? {
            id: typesetting.id,
            dateIn: typesetting.dateIn ? new Date(typesetting.dateIn).toISOString().slice(0, 10) : "",
            plateRan: typesetting.plateRan || "",
            prepTime: typesetting.prepTime || 0,
            approved: typesetting.approved || false,
            timeIn: typesetting.timeIn || "",
            orderItemId: orderItemId,
            workOrderItemId: workOrderItemId,
            cost: typesetting.cost ? typesetting.cost.toString() : "",
            typesettingOptions: typesetting.TypesettingOptions || [],
            typesettingProofs: typesetting.TypesettingProofs || [],
        } : {
            typesettingOptions: [],
            typesettingProofs: [],
        },
    });

    const updateTypesettingContext = (updatedTypesetting: TypesettingWithRelations) => {
        setTypesetting((prevTypesetting) =>
            prevTypesetting.map((type) =>
                type.id === updatedTypesetting.id ? { ...type, ...updatedTypesetting } : type
            )
        );
    };

    const updateTypesetting = api.typesettings.update.useMutation({
        onSuccess: (updatedTypesetting) => {
            updateTypesettingContext(updatedTypesetting);
            setSuccess("Typesetting updated successfully");
            onSubmit();
        },
        onError: (error) => {
            setError("Error updating typesetting");
            console.error("Error updating typesetting:", error);
        },
    });

    const createTypesetting = api.typesetting.create.useMutation({
        onSuccess: (newTypesetting) => {
            setTypesetting((prevTypesetting) => [...prevTypesetting, newTypesetting]);
            setSuccess("Typesetting created successfully");
            onSubmit();
        },
        onError: (error) => {
            setError("Error creating typesetting");
            console.error("Error creating typesetting:", error);
        },
    });

    useEffect(() => {
        if (!typesetting) {
            reset();
        }
    }, [typesetting, reset]);

    const cancel = () => {
        onCancel();
    }

    const submit = handleSubmit((data) => {
        const formattedData = {
            id: data.id,
            dateIn: data.dateIn ? new Date(data.dateIn).toISOString() : new Date().toISOString(),
            plateRan: data.plateRan,
            prepTime: data.prepTime,
            approved: data.approved,
            timeIn: data.timeIn,
            orderItemId: orderItemId,
            workOrderItemId: workOrderItemId,
            cost: data.cost ? parseFloat(data.cost) : undefined,
            typesettingOptions: data.typesettingOptions,
            typesettingProofs: data.typesettingProofs,
        };
        if (isAddMode) {
            createTypesetting.mutate(formattedData);
        } else {
            updateTypesetting.mutate(formattedData);
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
                        <span className="label-text">Approved</span>
                    </label>
                    <input type="checkbox" className="checkbox" {...register("approved")} />
                    {errors.approved && <span className="text-error">{errors.approved.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Cost</span>
                    </label>
                    <input type="number" step="0.01" className="input input-bordered" {...register("cost")} />
                    {errors.cost && <span className="text-error">{errors.cost.message}</span>}
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Date In</span>
                    </label>
                    <input type="date" className="input input-bordered" {...register("dateIn")} />
                    {errors.dateIn && <span className="text-error">{errors.dateIn.message}</span>}
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
                        <span className="label-text">Time In</span>
                    </label>
                    <input type="time" className="input input-bordered" {...register("timeIn")} />
                    {errors.timeIn && <span className="text-error">{errors.timeIn.message}</span>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-outline" onClick={cancel}>Cancel</button>
                <button type="reset" className="btn btn-outline" onClick={() => reset()}>Reset</button>
            </div>
        </form>
    );
}

export default TypesettingForm;
