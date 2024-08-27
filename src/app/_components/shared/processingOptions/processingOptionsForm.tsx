import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import { BindingType, ProcessingOptions } from "@prisma/client";

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

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Name</span>
                </label>
                <input
                    {...register("name")}
                    className={inputClass}
                    placeholder="Name"
                />
                {errors.name && <span className={errorClass}>{errors.name.message}</span>}
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Bindery Time</span>
                </label>
                <input
                    {...register("binderyTime", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="Bindery Time"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Binding</span>
                </label>
                <select {...register("binding")} className={inputClass}>
                    <option value="">Select Binding</option>
                    {Object.values(BindingType).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Cutting</span>
                </label>
                <input
                    {...register("cutting")}
                    className={inputClass}
                    placeholder="Cutting"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Description</span>
                </label>
                <textarea
                    {...register("description")}
                    className={`${inputClass} h-24`}
                    placeholder="Description"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Drilling</span>
                </label>
                <input
                    {...register("drilling")}
                    className={inputClass}
                    placeholder="Drilling"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Folding</span>
                </label>
                <input
                    {...register("folding")}
                    className={inputClass}
                    placeholder="Folding"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Numbering Color</span>
                </label>
                <input
                    {...register("numberingColor")}
                    className={inputClass}
                    placeholder="Numbering Color"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Numbering End</span>
                </label>
                <input
                    {...register("numberingEnd", { valueAsNumber: true })}
                    type="number"
                    className={inputClass}
                    placeholder="Numbering End"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Numbering Start</span>
                </label>
                <input
                    {...register("numberingStart", { valueAsNumber: true })}
                    type="number"
                    className={inputClass}
                    placeholder="Numbering Start"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Other</span>
                </label>
                <input
                    {...register("other")}
                    className={inputClass}
                    placeholder="Other"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Padding</span>
                </label>
                <input
                    {...register("padding")}
                    className={inputClass}
                    placeholder="Padding"
                />
            </div>

            <div className="form-control">
                <label className={labelClass}>
                    <span className={labelTextClass}>Stitching</span>
                </label>
                <input
                    {...register("stitching")}
                    className={inputClass}
                    placeholder="Stitching"
                />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={onCancel} className="btn btn-ghost">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {initialData ? "Update" : "Add"} Bindery Options
                </button>
            </div>
        </form>
    );
};

export default ProcessingOptionsForm;