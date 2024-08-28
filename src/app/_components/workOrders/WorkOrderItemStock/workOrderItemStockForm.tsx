// ~/app/_components/shared/workOrderItemStock/workOrderItemStockForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { StockStatus } from '@prisma/client';

// Define the schema based on Prisma types
const workOrderItemStockSchema = z.object({
    stockQty: z.number().int().positive(),
    costPerM: z.number().positive(),
    totalCost: z.number().optional(),
    from: z.string().optional(),
    expectedDate: z.string().optional(),
    orderedDate: z.string().optional(),
    received: z.boolean(),
    receivedDate: z.string().optional(),
    notes: z.string().optional(),
    stockStatus: z.nativeEnum(StockStatus),
    supplier: z.string().optional(),
    workOrderItemId: z.string(),
});

type WorkOrderItemStockFormData = z.infer<typeof workOrderItemStockSchema>;

interface WorkOrderItemStockFormProps {
    workOrderItemId: string;
    stockId: string | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const WorkOrderItemStockForm: React.FC<WorkOrderItemStockFormProps> = ({
    workOrderItemId,
    stockId,
    onSuccess,
    onCancel
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkOrderItemStockFormData>({
        resolver: zodResolver(workOrderItemStockSchema),
        defaultValues: {
            workOrderItemId,
            received: false,
            stockStatus: StockStatus.OnHand,
        },
    });

    const { data: existingStock } = api.workOrderItemStocks.getByID.useQuery(
        stockId as string,
        { enabled: !!stockId }
    );

    const createStock = api.workOrderItemStocks.create.useMutation({
        onSuccess: () => {
            onSuccess();
            reset();
        },
    });

    const updateStock = api.workOrderItemStocks.update.useMutation({
        onSuccess: () => {
            onSuccess();
        },
    });

    useEffect(() => {
        if (existingStock) {
            reset({
                workOrderItemId: existingStock.workOrderItemId,
                stockQty: existingStock.stockQty,
                costPerM: Number(existingStock.costPerM),
                totalCost: existingStock.totalCost ? Number(existingStock.totalCost) : undefined,
                from: existingStock.from || undefined,
                expectedDate: existingStock.expectedDate ? existingStock.expectedDate.toString().split('T')[0] : undefined,
                orderedDate: existingStock.orderedDate ? existingStock.orderedDate.toString().split('T')[0] : undefined,
                received: existingStock.received,
                receivedDate: existingStock.receivedDate ? existingStock.receivedDate.toString().split('T')[0] : undefined,
                notes: existingStock.notes || undefined,
                stockStatus: existingStock.stockStatus,
                supplier: existingStock.supplier || undefined,
            });
        }
    }, [existingStock, reset]);

    const onSubmit = (data: WorkOrderItemStockFormData) => {
        const formattedData = {
            ...data,
            expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
            orderedDate: data.orderedDate ? new Date(data.orderedDate) : undefined,
            receivedDate: data.receivedDate ? new Date(data.receivedDate) : undefined,
            from: data.from || undefined,
            supplier: data.supplier || undefined,
            notes: data.notes || undefined,
        };

        if (stockId) {
            updateStock.mutate({
                id: stockId,
                data: formattedData
            });
        } else {
            createStock.mutate(formattedData);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="label">
                    <span className="label-text">Quantity</span>
                </label>
                <input type="number" {...register('stockQty', { valueAsNumber: true })} className="input input-bordered w-full" />
                {errors.stockQty && <p className="text-red-500">{errors.stockQty.message}</p>}
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Cost Per M</span>
                </label>
                <input type="number" step="0.01" {...register('costPerM')} className="input input-bordered w-full" />
                {errors.costPerM && <p className="text-red-500">{errors.costPerM.message}</p>}
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Supplier</span>
                </label>
                <input type="text" {...register('supplier')} className="input input-bordered w-full" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Stock Status</span>
                </label>
                <select {...register('stockStatus')} className="select select-bordered w-full">
                    {Object.values(StockStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Expected Date</span>
                </label>
                <input type="date" {...register('expectedDate', { valueAsDate: true })} className="input input-bordered w-full" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Ordered Date</span>
                </label>
                <input type="date" {...register('orderedDate', { valueAsDate: true })} className="input input-bordered w-full" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Received</span>
                </label>
                <input type="checkbox" {...register('received')} className="checkbox" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Received Date</span>
                </label>
                <input type="date" {...register('receivedDate', { valueAsDate: true })} className="input input-bordered w-full" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Notes</span>
                </label>
                <textarea {...register('notes')} className="textarea textarea-bordered w-full" />
            </div>

            <div className="flex justify-end space-x-2">
                <button type="submit" className="btn btn-primary">
                    {stockId ? 'Update' : 'Add'} Stock
                </button>
                <button type="button" onClick={onCancel} className="btn btn-ghost">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default WorkOrderItemStockForm;