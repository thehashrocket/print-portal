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

const processingOptionsSchema = z.object({
    id: z.string().optional(),
    name: z.string().nonempty("Name is required"),
    binderyTime: z.number().optional(),
    binding: z.string().optional(),
    cutting: z.string().optional(),
    description: z.string().optional(),
    drilling: z.string().optional(),
    folding: z.string().optional(),
    numberingColor: z.string().optional(),
    numberingEnd: z.number().optional(),
    numberingStart: z.number().optional(),
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
    isActive?: boolean;
    onClose?: () => void;
    onCancel?: () => void;
}

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = ({
    initialData,
    orderItemId,
    workOrderItemId,
    onClose,
    onCancel,
    isActive = false
}) => {
    const { createOption, updateOption } = useProcessingOptions();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(processingOptionsSchema),
        defaultValues: {
            ...initialData,
            binderyTime: initialData?.binderyTime || 0,
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
    const labelClass = "label";
    const labelTextClass = "label-text";
    const errorClass = "text-error text-sm mt-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("id")} />
            <input type="hidden" {...register("orderItemId")} />
            <input type="hidden" {...register("workOrderItemId")} />

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                    {...register("name")}
                    className={inputClass}
                    placeholder="Name"
                />
                {errors.name && <span className={errorClass}>{errors.name.message}</span>}
            </div>

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
                <select {...register("binding")} className={inputClass}>
                    <option value="">Select Binding</option>
                    {Object.values(BindingType).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
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
                <Label htmlFor="numberingEnd">Numbering End</Label>
                <Input
                    type="number"
                    {...register("numberingEnd", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="Numbering End"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="numberingStart">Numbering Start</Label>
                <Input
                    type="number"
                    {...register("numberingStart", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="Numbering Start"
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
                    variant="secondary"
                    onClick={onCancel}
                >
                    Cancel
                </Button>

            </div>
        </form>
    );
};

export default ProcessingOptionsForm;