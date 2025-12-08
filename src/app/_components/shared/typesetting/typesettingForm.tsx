import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "~/trpc/react";
import { TypesettingStatus, type Typesetting, type TypesettingOption, type TypesettingProof } from "@prisma/client";
import { normalizeTypesetting } from "~/utils/dataNormalization";
import { type TypesettingWithRelations } from "~/app/contexts/TypesettingContext";
import { Decimal } from "decimal.js";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import { SelectField } from "../../shared/ui/SelectField/SelectField";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { cn } from "~/lib/utils";

const typesettingFormSchema = z.object({
    id: z.string().optional(),
    approved: z.boolean(),
    cost: z.number().optional().default(0),
    dateIn: z.string().min(1, "Date In is required"),
    followUpNotes: z.string().nullable(),
    orderItemId: z.string().nullable(),
    plateRan: z.string().nullable(),
    prepTime: z.number().nullable(),
    status: z.nativeEnum(TypesettingStatus, {
        error: "Status is required",
    }),
    timeIn: z.string().min(1, "Time In is required"),
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

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, watch } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingFormSchema) as any,
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
            createTypesetting.mutate(formattedData as any);
        } else {
            const updateData = {
                ...formattedData,
                id: data.id || '',
            };
            updateTypesetting.mutate(updateData as any);
        }
    });

    return (
        <form onSubmit={submit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-6 flex items-center gap-2">
                    <span className="h-4 w-4">⚠️</span>
                    <p>{error}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 mb-4">
                <div className="form-control">
                    <Label htmlFor="dateIn" className="flex gap-1">
                        Date In <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        {...register("dateIn")}
                        className={cn(errors.dateIn && "border-red-500")}
                    />
                    {errors.dateIn && (
                        <span className="text-sm text-red-500 mt-1">{errors.dateIn.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="timeIn" className="flex gap-1">
                        Time In <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="time"
                        {...register("timeIn")}
                        className={cn(errors.timeIn && "border-red-500")}
                    />
                    {errors.timeIn && (
                        <span className="text-sm text-red-500 mt-1">{errors.timeIn.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="plateRan">Plate Ran</Label>
                    <Input
                        {...register("plateRan")}
                        className={cn(errors.plateRan && "border-red-500")}
                    />
                    {errors.plateRan && (
                        <span className="text-sm text-red-500 mt-1">{errors.plateRan.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="prepTime">Design Time</Label>
                    <Input
                        type="number"
                        {...register("prepTime", {
                            setValueAs: v => v === "" ? null : parseInt(v, 10),
                            valueAsNumber: true
                        })}
                        className={cn(errors.prepTime && "border-red-500")}
                    />
                    {errors.prepTime && (
                        <span className="text-sm text-red-500 mt-1">{errors.prepTime.message}</span>
                    )}
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                        id="approved" 
                        {...register("approved")}
                    />
                    <Label
                        htmlFor="approved"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Approved
                    </Label>
                    {errors.approved && (
                        <span className="text-sm text-red-500 mt-1">{errors.approved.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                        type="number"
                        {...register("cost", {
                            setValueAs: v => v === "" ? null : parseInt(v, 10),
                            valueAsNumber: true
                        })}
                        step="0.01"
                        className={cn(errors.cost && "border-red-500")}
                    />
                    {errors.cost && (
                        <span className="text-sm text-red-500 mt-1">{errors.cost.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="status" className="flex gap-1">
                        Status <span className="text-red-500">*</span>
                    </Label>
                    <SelectField
                        options={Object.values(TypesettingStatus).map((status) => ({ value: status, label: status }))}
                        value={watch('status')}
                        onValueChange={(value: string) => setValue("status", value as TypesettingStatus)}
                        placeholder="Select status..."
                    />
                    {errors.status && (
                        <span className="text-sm text-red-500 mt-1">{errors.status.message}</span>
                    )}
                </div>

                <div className="form-control">
                    <Label htmlFor="followUpNotes">Follow Up Notes</Label>
                    <Textarea
                        {...register("followUpNotes")}
                        className={cn(errors.followUpNotes && "border-red-500")}
                    />
                    {errors.followUpNotes && (
                        <span className="text-sm text-red-500 mt-1">{errors.followUpNotes.message}</span>
                    )}
                </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
                <span className="text-red-500">*</span> Required fields
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="default"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                    variant="outline"
                    onClick={onCancel}
                    type="button"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

export default TypesettingForm;
