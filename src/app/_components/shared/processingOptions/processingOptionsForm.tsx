// ~/src/app/_components/shared/processingOptions/processingOptionsForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import { BindingType, type ProcessingOptions } from "@prisma/client";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { SelectField } from "../../shared/ui/SelectField/SelectField";

const processingOptionsSchema = z.object({
    id: z.string().optional(),
    binderyTime: z.number().optional(),
    binding: z.string().optional(),
    cutting: z.string().optional(),
    description: z.string().optional(),
    drilling: z.string().optional(),
    folding: z.string().optional(),
    numberingColor: z.string().optional(),
    numberingEnd: z.number().optional().default(0),
    numberingStart: z.number().optional().default(0),
    other: z.string().optional(),
    padding: z.string().optional(),
    stitching: z.string().optional(),
    orderItemId: z.string().optional().nullable(),
    workOrderItemId: z.string().optional().nullable(),
});

interface ProcessingOptionsFormProps {
    initialData?: Partial<ProcessingOptions>;
    orderItemId?: string;
    workOrderItemId?: string;
    onClose?: () => void;
    onCancel?: () => void;
}

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = ({
    initialData,
    orderItemId,
    workOrderItemId,
    onClose,
    onCancel,
}) => {
    const { createOption, updateOption } = useProcessingOptions();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm({
        resolver: zodResolver(processingOptionsSchema),
        defaultValues: {
            id: initialData?.id,
            binderyTime: initialData?.binderyTime || 0,
            binding: initialData?.binding || '',
            cutting: initialData?.cutting || '',
            description: initialData?.description || '',
            drilling: initialData?.drilling || '',
            folding: initialData?.folding || '',
            numberingColor: initialData?.numberingColor || '',
            numberingEnd: initialData?.numberingEnd || 0,
            numberingStart: initialData?.numberingStart || 0,
            other: initialData?.other || '',
            padding: initialData?.padding || '',
            stitching: initialData?.stitching || '',
            orderItemId: initialData?.orderItemId || orderItemId,
            workOrderItemId: initialData?.workOrderItemId || workOrderItemId
        },
    });

    const onSubmit = async (data: any) => {
        try {
            if (initialData && initialData.id) {
                await updateOption.mutateAsync(data);
            } else {
                await createOption.mutateAsync(data);
            }
            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to save option", error);
        }
    };

    const inputClass = "input input-bordered w-full";
    const errorClass = "text-error text-sm mt-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("id")} />
            <input type="hidden" {...register("orderItemId")} />
            <input type="hidden" {...register("workOrderItemId")} />

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="binderyTime">Bindery Time</Label>
                <Input
                    type="number"
                    {...register("binderyTime", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="Bindery Time"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="binding">Binding</Label>
                <SelectField
                    options={Object.values(BindingType).map(type => ({ value: type, label: type }))}
                    value={watch('binding') || ''}
                    onValueChange={(value) => setValue('binding', value as BindingType)}
                    placeholder="Select Binding"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="cutting">Cutting</Label>
                <Input
                    {...register("cutting")}
                    className={inputClass}
                    placeholder="Cutting"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="description">Description</Label>
                <textarea
                    {...register("description")}
                    className={`${inputClass} h-24`}
                    placeholder="Description"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="drilling">Drilling</Label>
                <Input
                    {...register("drilling")}
                    className={inputClass}
                    placeholder="Drilling"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="folding">Folding</Label>
                <Input
                    {...register("folding")}
                    className={inputClass}
                    placeholder="Folding"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="numberingColor">Numbering Color</Label>
                <Input
                    {...register("numberingColor")}
                    className={inputClass}
                    placeholder="Numbering Color"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="numberingStart">Numbering Start</Label>
                <Input
                    type="number"
                    {...register("numberingStart", {
                        setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
                    })}
                    className={inputClass}
                    placeholder="Numbering Start"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="numberingEnd">Numbering End</Label>
                <Input
                    type="number"
                    {...register("numberingEnd", {
                        setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
                    })}
                    className={inputClass}
                    placeholder="Numbering End"
                />
            </div>

            

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="other">Other</Label>
                <Input
                    {...register("other")}
                    className={inputClass}
                    placeholder="Other"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="padding">Padding</Label>
                <Input
                    {...register("padding")}
                    className={inputClass}
                    placeholder="Padding"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="stitching">Stitching</Label>
                <Input
                    {...register("stitching")}
                    className={inputClass}
                    placeholder="Stitching"
                />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
                <Button
                    variant="default"
                    type="submit"
                >
                    {initialData ? "Update" : "Add"} Bindery Options
                </Button>
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>

            </div>
        </form>
    );
};

export default ProcessingOptionsForm;