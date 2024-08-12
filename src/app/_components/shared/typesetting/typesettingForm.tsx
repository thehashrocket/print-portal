"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { TypesettingStatus, Typesetting } from "@prisma/client";
import { Prisma } from "@prisma/client";

const typesettingFormSchema = z.object({
    id: z.string().optional(),
    dateIn: z.date(),
    cost: z.string().optional().nullable(),
    timeIn: z.string(),
    plateRan: z.string().optional().nullable(),
    prepTime: z.number().min(0, "Prep time must be greater than or equal to 0").nullable(),
    approved: z.boolean(),
    status: z.nativeEnum(TypesettingStatus),
    followUpNotes: z.string().optional().nullable(),
    orderItemId: z.string().nullable(),
    workOrderItemId: z.string().nullable(),
    typesettingOptions: z.array(z.object({
        option: z.string(),
        selected: z.boolean()
    })).optional(),
    typesettingProofs: z.array(z.object({
        approved: z.boolean(),
        notes: z.string(),
        dateSubmitted: z.string(),
        proofNumber: z.number()
    })).optional(),
});

type TypesettingFormData = z.infer<typeof typesettingFormSchema>;

interface TypesettingFormProps {
    typesetting?: Typesetting | null;
    orderItemId: string;
    workOrderItemId: string;
    onSubmit: () => void;
    onCancel: () => void;
}

export function TypesettingForm({ typesetting, orderItemId, workOrderItemId, onSubmit, onCancel }: TypesettingFormProps) {
    const isAddMode = !typesetting;
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [typesettingData, setTypesettingData] = useState<Typesetting[]>([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingFormSchema),
        defaultValues: typesetting ? {
            id: typesetting.id,
            dateIn: new Date(typesetting.dateIn), // Convert string to Date object
            timeIn: typesetting.timeIn || "",
            plateRan: typesetting.plateRan || '',
            prepTime: typesetting.prepTime || null,
            approved: typesetting.approved,
            cost: typesetting.cost || null,
            status: typesetting.status,
            followUpNotes: typesetting.followUpNotes || null,
            orderItemId: orderItemId || null,
            workOrderItemId: workOrderItemId || null,
        } : {
            dateIn: new Date(), // Use Date object for default value
            timeIn: "",
            plateRan: '',
            prepTime: null,
            approved: false,
            cost: null,
            status: TypesettingStatus.InProgress,
            followUpNotes: null,
            orderItemId: orderItemId || null,
            workOrderItemId: workOrderItemId || null,
        },
    });

    const updateTypesettingContext = (updatedTypesetting: Typesetting) => {
        setTypesettingData((prevTypesetting) => {
            return prevTypesetting.map((type) =>
                type.id === updatedTypesetting.id ? { ...type, ...updatedTypesetting } : type
            );
        });
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

    const createTypesetting = api.typesettings.create.useMutation({
        onSuccess: (newTypesetting) => {
            setTypesettingData((prevTypesetting) => [
                ...prevTypesetting,
                {
                    ...newTypesetting,
                    TypesettingOptions: [],
                    TypesettingProofs: []
                }
            ]);
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
        } else {
            setTypesettingData([typesetting]);
        }
    }, [typesetting, reset]);

    const submit = handleSubmit((data) => {
        const formattedData: Partial<Typesetting> & { dateIn: Date } = {
            ...data,
            plateRan: data.plateRan || '',
            dateIn: data.dateIn, // This is already a Date object
            cost: data.cost !== null ? data.cost.toString() : null, // Convert cost to string
            prepTime: data.prepTime !== null ? Number(data.prepTime) : null, // Ensure prepTime is a number
        };

        if (isAddMode) {
            createTypesetting.mutate(formattedData as Typesetting);
        } else {
            updateTypesetting.mutate(formattedData as Typesetting);
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
                        {...register("cost")}
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
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button type="reset" className="btn btn-outline" onClick={() => reset()}>Reset</button>
            </div>
        </form>
    );
}

export default TypesettingForm;