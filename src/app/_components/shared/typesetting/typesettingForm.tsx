import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { TypesettingStatus, type Typesetting, type TypesettingOption, type TypesettingProof } from "@prisma/client";
import { SerializedTypesetting, SerializedTypesettingOption, SerializedTypesettingProof } from "~/types/serializedTypes";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import { type TypesettingWithRelations } from "~/app/contexts/TypesettingContext";
import { Decimal } from "decimal.js";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { SelectField } from "../../shared/ui/SelectField/SelectField";

const typesettingFormSchema = z.object({
    id: z.string().optional(),
    approved: z.boolean(),
    cost: z.number().optional().default(0),
    dateIn: z.string(),
    followUpNotes: z.string().nullable(),
    orderItemId: z.string().nullable(),
    plateRan: z.string().nullable(),
    prepTime: z.number().nullable(),
    status: z.nativeEnum(TypesettingStatus),
    timeIn: z.string(),
    workOrderItemId: z.string().nullable(),
});

type TypesettingFormData = z.infer<typeof typesettingFormSchema>;

interface TypesettingFormProps {
    typesetting?: TypesettingWithRelations | null;
    orderItemId: string;
    workOrderItemId: string;
    onSubmit: (newTypesetting: TypesettingWithRelations) => void;
    onCancel: () => void;
}

function ensureCompleteTypesettingData(data: Partial<Typesetting>): Typesetting & {
    TypesettingOptions: TypesettingOption[];
    TypesettingProofs: TypesettingProof[];
} {
    return {
        ...data,
        TypesettingOptions: [],
        TypesettingProofs: [],
    } as Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    };
}

export function TypesettingForm({ typesetting, orderItemId, workOrderItemId, onSubmit, onCancel }: TypesettingFormProps) {
    const isAddMode = !typesetting;
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingFormSchema),
        defaultValues: typesetting ? {
            ...typesetting,
            cost: typesetting.cost !== null ? new Decimal(typesetting.cost).toNumber() : 0,
            dateIn: new Date(typesetting.dateIn).toISOString().split('T')[0],
        } : {
            plateRan: null,
            prepTime: null,
            cost: 0,
            followUpNotes: null,
            approved: false,
            status: TypesettingStatus.InProgress,
            dateIn: new Date().toISOString().split('T')[0],
            timeIn: "",
            orderItemId: null,
            workOrderItemId: null,
        },
    });

    const updateTypesetting = api.typesettings.update.useMutation({
        onSuccess: (updatedTypesetting) => {
            const completeTypesetting = ensureCompleteTypesettingData(updatedTypesetting);
            const normalizedTypesetting = normalizeTypesetting(completeTypesetting);
            onSubmit(normalizedTypesetting);
        },
        onError: (error) => {
            setError("Error updating typesetting");
            console.error("Error updating typesetting:", error);
        },
    });

    const createTypesetting = api.typesettings.create.useMutation({
        onSuccess: (newTypesetting) => {
            const completeTypesetting = ensureCompleteTypesettingData(newTypesetting);
            const normalizedTypesetting = normalizeTypesetting(completeTypesetting);
            onSubmit(normalizedTypesetting);
        },
        onError: (error) => {
            setError("Error creating typesetting");
            console.error("Error creating typesetting:", error);
        },
    });

    const submit = handleSubmit((data) => {
        const formattedData = {
            ...data,
            followUpNotes: data.followUpNotes || undefined,
            orderItemId: orderItemId || undefined,
            workOrderItemId: workOrderItemId || undefined,
            dateIn: new Date(data.dateIn),
            cost: data.cost !== null ? Number(data.cost) : 0,
        };

        if (isAddMode) {
            createTypesetting.mutate(formattedData);
        } else {
            const updateData = {
                ...formattedData,
                id: data.id || '',
            };
            updateTypesetting.mutate(updateData);
        }
    });

    return (
        <form onSubmit={submit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {error && <div className="alert alert-error">{error}</div>}
            {/* Form fields */}
            <div className="grid grid-cols-1 gap-6 mb-4">
                <div className="form-control">
                    <Label htmlFor="dateIn">Date In</Label>
                    <input
                        type="date"
                        className="input input-bordered"
                        {...register("dateIn")}
                    />
                    {errors.dateIn && <span className="text-error">{errors.dateIn.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="timeIn">Time In</Label>
                    <input type="time" className="input input-bordered" {...register("timeIn")} />
                    {errors.timeIn && <span className="text-error">{errors.timeIn.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="plateRan">Plate Ran</Label>
                    <input
                        type="text"
                        className="input input-bordered"
                        {...register("plateRan")}
                    />
                    {errors.plateRan && <span className="text-error">{errors.plateRan.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="prepTime">Design Time</Label>
                    <input
                        type="number"
                        className="input input-bordered"
                        {...register("prepTime", {
                            setValueAs: v => v === "" ? null : parseInt(v, 10),
                            valueAsNumber: true
                        })}
                    />
                    {errors.prepTime && <span className="text-error">{errors.prepTime.message}</span>}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="approved" {...register("approved")} />
                    <Label
                        htmlFor="approved"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Approved
                    </Label>
                    {errors.approved && <span className="text-error">{errors.approved.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="cost">Cost</Label>
                    <input
                        type="number"
                        className="input input-bordered"
                        {...register("cost", {
                            setValueAs: v => v === "" ? null : parseInt(v, 10),
                            valueAsNumber: true
                        })}
                        step="0.01"
                    />
                    {errors.cost && <span className="text-error">{errors.cost.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="status">Status</Label>
                    <SelectField
                        options={Object.values(TypesettingStatus).map((status) => ({ value: status, label: status }))}
                        value={watch('status')}
                        onValueChange={(value: string) => setValue("status", value as TypesettingStatus)}
                        placeholder="Select status..."
                        required={true}
                    />
                    {errors.status && <span className="text-error">{errors.status.message}</span>}
                </div>
                <div className="form-control">
                    <Label htmlFor="followUpNotes">Follow Up Notes</Label>
                    <textarea
                        className="textarea textarea-bordered"
                        {...register("followUpNotes")}
                    />
                    {errors.followUpNotes && <span className="text-error">{errors.followUpNotes.message}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="default"
                    type="submit"
                >
                    Submit
                </Button>
                <Button
                    variant="secondary"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default TypesettingForm;