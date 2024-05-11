// client side NextJS component used to create or edit Tyhpesetting, TypsettingOptions, and TypesettingProofs
// Takes advantage of react-hook-form, zod, and trpc to validate and submit data to the server

// Path: src/app/_components/shared/typesetting/typesettingForm.tsx

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Typesetting, TypesettingOption, TypesettingProof } from "@prisma/client";
import { api } from "~/trpc/react";

const typesettingFormSchema = z.object({
    id: z.string(),
    dateIn: z.string(),
    plateRan: z.string(),
    prepTime: z.number().min(0, "Prep time must be greater than or equal to 0"),
    approved: z.boolean(),
    timeIn: z.string(),
    orderItemId: z.string().optional(),
    workOrderItemId: z.string().optional(),
    cost: z.string().optional(),
});

type TypesettingFormData = z.infer<typeof typesettingFormSchema>;

export function TypesettingForm({ typesetting, workOrderItemId, orderItemId, onSubmit, onCancel }: {
    typesetting: Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    } | null;
    orderItemId: string;
    workOrderItemId: string;
    onSubmit: (data: TypesettingFormData) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<TypesettingFormData>({
        resolver: zodResolver(typesettingFormSchema),
        defaultValues: {
            id: typesetting?.id || "",
            dateIn: typesetting?.dateIn ? new Date(typesetting.dateIn).toISOString().slice(0, 10) : "",
            plateRan: typesetting?.plateRan || "",
            prepTime: typesetting?.prepTime || 0,
            approved: typesetting?.approved || false,
            timeIn: typesetting?.timeIn || "",
            orderItemId: orderItemId,
            workOrderItemId: workOrderItemId,
            cost: typesetting?.cost ? typesetting.cost.toString() : "",
        }
    });

    // implement reset functionality
    React.useEffect(() => {
        if (!typesetting) {
            reset();
        }
    }, [typesetting]);

    const cancel = () => {
        onCancel();
    }

    const submit = handleSubmit((data) => {
        const formattedData = {
            id: typesetting?.id || "",
            dateIn: data.dateIn,
            plateRan: data.plateRan,
            prepTime: data.prepTime,
            approved: data.approved,
            timeIn: data.timeIn,
            orderItemId: orderItemId,
            workOrderItemId: workOrderItemId,
            cost: data.cost,
        };
        onSubmit(formattedData);
    });

    return (
        <form onSubmit={submit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="grid grid-cols-1 gap-6">
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
                    <input type="text" className="input input-bordered" {...register("cost")} />
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
                    <input type="text" className="input input-bordered" {...register("timeIn")} />
                    {errors.timeIn && <span className="text-error">{errors.timeIn.message}</span>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <button type="submit" className="btn btn-primary">Submit</button>
                    <button className="btn btn-outline" onClick={cancel}>Cancel</button>
                    <button type="reset" className="btn btn-outline" onClick={() => reset()}>Reset</button>
                </div>
            </div>
        </form>
    );
}

export default TypesettingForm;
// Path: src/app/_components/shared/typesetting/typesettingComponent.tsx
