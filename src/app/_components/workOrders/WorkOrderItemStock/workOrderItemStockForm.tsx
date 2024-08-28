// ~/app/_components/shared/workOrderItemStock/workOrderItemStockForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { StockStatus } from '@prisma/client';
import { SerializedWorkOrderItemStock } from '~/types/serializedTypes';

const workOrderItemStockSchema = z.object({
    costPerM: z.number(),
    expectedDate: z.date().optional(),
    from: z.string().optional(),
    notes: z.string().optional(),
    orderedDate: z.date().optional(),
    received: z.boolean(),
    receivedDate: z.date().optional(),
    stockQty: z.number(),
    stockStatus: z.nativeEnum(StockStatus),
    supplier: z.string().optional(),
    totalCost: z.number().optional(),
    workOrderItemId: z.string(),
});

type WorkOrderItemStockFormData = z.infer<typeof workOrderItemStockSchema>;

interface WorkOrderItemStockFormProps {
    workOrderItemId: string;
    stockId: string | null;
    onStockAdded: (stock: SerializedWorkOrderItemStock) => void;
    onStockUpdated: (stock: SerializedWorkOrderItemStock) => void;
    onCancel: () => void;
}

const WorkOrderItemStockForm: React.FC<WorkOrderItemStockFormProps> = ({
    workOrderItemId,
    stockId,
    onStockAdded,
    onStockUpdated,
    onCancel
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkOrderItemStockFormData>({
        resolver: zodResolver(workOrderItemStockSchema),
    });

    const { data: existingStock } = api.workOrderItemStocks.getByID.useQuery(
        stockId as string,
        { enabled: !!stockId }
    );

    const createStock = api.workOrderItemStocks.create.useMutation({
        onSuccess: (data) => {
            onStockAdded(data);
            reset();
        },
    });

    const updateStock = api.workOrderItemStocks.update.useMutation({
        onSuccess: (data) => {
            onStockUpdated(data);
        },
    });

    useEffect(() => {
        if (existingStock) {
            reset();
        }
    }, [existingStock, reset]);

    const onSubmit = (data: WorkOrderItemStockFormData) => {
        const stockData = {
            ...data,
            workOrderItemId,
            expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
            orderedDate: data.orderedDate ? new Date(data.orderedDate) : undefined,
            receivedDate: data.receivedDate ? new Date(data.receivedDate) : undefined,
            costPerM: Number(data.costPerM), // Convert costPerM to a number
        } as WorkOrderItemStockFormData & { createdById: string; workOrderItemId: string; id?: string };

        if (stockId) {
            updateStock.mutate({
                id: stockId,
                data: stockData
            });
        } else {
            createStock.mutate(stockData);
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
                <input type="number" step="0.01" {...register('costPerM', { valueAsNumber: true })} className="input input-bordered w-full" />
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
                <input type="date" {...register('expectedDate')} className="input input-bordered w-full" />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Ordered Date</span>
                </label>
                <input type="date" {...register('orderedDate')} className="input input-bordered w-full" />
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
                <input type="date" {...register('receivedDate')} className="input input-bordered w-full" />
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