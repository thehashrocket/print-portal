import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProcessingOptions } from "~/app/contexts/ProcessingOptionsContext";
import { ProcessingOptions } from "@prisma/client";

const processingOptionsSchema = z.object({
    id: z.string().optional(),
    name: z.string().nonempty("Name is required"),
    binderyTime: z.string().optional(),
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

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = (
    {
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("id")} />
            <input type="hidden" {...register("orderItemId")} />
            <input type="hidden" {...register("workOrderItemId")} />
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    {...register("name")}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Name"
                />
                {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Bindery Time</label>
                <input
                    {...register("binderyTime")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Bindery Time"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Binding</label>
                <input
                    {...register("binding")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Binding"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Cutting</label>
                <input
                    {...register("cutting")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Cutting"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    {...register("description")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Description"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Drilling</label>
                <input
                    {...register("drilling")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Drilling"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Folding</label>
                <input
                    {...register("folding")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Folding"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numbering Color</label>
                <input
                    {...register("numberingColor")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Numbering Color"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numbering End</label>
                <input
                    {...register("numberingEnd", { valueAsNumber: true })}
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Numbering End"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Numbering Start</label>
                <input
                    {...register("numberingStart", { valueAsNumber: true })}
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Numbering Start"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Other</label>
                <input
                    {...register("other")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Other"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Padding</label>
                <input
                    {...register("padding")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Padding"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Stitching</label>
                <input
                    {...register("stitching")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Stitching"
                />
            </div>
            <button type="submit" className="btn btn-primary">{initialData ? "Update" : "Add"} Processing Option</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        </form>
    );
};

export default ProcessingOptionsForm;
