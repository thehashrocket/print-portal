// ~/app/_components/orders/orderItemStock/orderItemStockForm.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { StockStatus, type PaperProduct, PaperType } from '@prisma/client';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { SelectField } from '../../shared/ui/SelectField/SelectField';
import { formatPaperProductLabel } from '~/utils/formatters';
const orderItemStockSchema = z.object({
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
    orderItemId: z.string(),
    paperProductId: z.string().optional(),
});

type OrderItemStockFormData = z.infer<typeof orderItemStockSchema>;

interface OrderItemStockFormProps {
    orderItemId: string;
    stockId: string | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const OrderItemStockForm: React.FC<OrderItemStockFormProps> = ({
    orderItemId,
    stockId,
    onSuccess,
    onCancel
}) => {
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<OrderItemStockFormData>({
        resolver: zodResolver(orderItemStockSchema),
        defaultValues: {
            orderItemId,
            received: false,
            stockStatus: StockStatus.OnHand,
        },
    });

    const [selectedPaperType, setSelectedPaperType] = useState<PaperType | null>(null);
    const { data: paperProducts } = api.paperProducts.getAll.useQuery();
    const { data: paperProductsByType, isLoading: isPaperProductsLoading } = api.paperProducts.getByProductType.useQuery(
        selectedPaperType as PaperType,
        { 
            enabled: !!selectedPaperType,
        }
    );
    const uniquePaperProducts = paperProducts?.filter((paperProduct, index, self) =>
        index === self.findIndex(t => t.brand === paperProduct.brand && t.size === paperProduct.size && t.paperType === paperProduct.paperType && t.finish === paperProduct.finish && t.weightLb === paperProduct.weightLb)
    );

    const { data: existingStock } = api.orderItemStocks.getByID.useQuery(
        stockId as string,
        { enabled: !!stockId }
    );

    

    const createStock = api.orderItemStocks.create.useMutation({
        onSuccess: () => {
            onSuccess();
            reset();
        },
    });

    const updateStock = api.orderItemStocks.update.useMutation({
        onSuccess: () => {
            onSuccess();
        },
    });

    useEffect(() => {
        if (existingStock) {
            reset({
                orderItemId: existingStock.orderItemId,
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
                paperProductId: existingStock.paperProductId || undefined,
            });
        }
    }, [existingStock, reset]);

    const onSubmit = (data: OrderItemStockFormData) => {
        const formattedData = {
            ...data,
            stockQty: Number(data.stockQty),
            costPerM: Number(data.costPerM),
            totalCost: data.totalCost ? Number(data.totalCost) : undefined,
            expectedDate: data.expectedDate ? new Date(data.expectedDate + 'T12:00:00') : undefined,
            orderedDate: data.orderedDate ? new Date(data.orderedDate + 'T12:00:00') : undefined,
            receivedDate: data.receivedDate ? new Date(data.receivedDate + 'T12:00:00') : undefined,
            from: data.from || undefined,
            supplier: data.supplier || undefined,
            notes: data.notes || undefined,
            paperProductId: data.paperProductId || undefined,
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
            <div className="space-y-2">
                {uniquePaperProducts && (
                    <div className="flex flex-row gap-2">
                        <SelectField
                            options={ Object.values(PaperType).map((paperType) => ({
                                value: paperType,
                                label: paperType
                            }))}
                            value={selectedPaperType ?? ''}
                            onValueChange={(value) => {
                                setSelectedPaperType(value as PaperType);
                            }}
                            placeholder="Select paper type..."
                        />
                        <SelectField
                            options={(paperProductsByType ?? []).map(product => ({
                                value: product.id,
                                label: formatPaperProductLabel(product)
                            }))}
                            value={watch('paperProductId') ?? ''}
                            onValueChange={(value) => setValue('paperProductId', value)}
                            placeholder={isPaperProductsLoading ? "Loading..." : "Select paper product..."}
                            disabled={!selectedPaperType || isPaperProductsLoading}
                        />
                    </div>
                )}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="stockQty">Quantity</Label>
                <Input
                    type="number"
                    {...register('stockQty', { valueAsNumber: true })}
                    className="input input-bordered w-full"
                />
                {errors.stockQty && <p className="text-red-500">{errors.stockQty.message}</p>}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="costPerM">Cost Per M</Label>
                <Input
                    type="number"
                    step="0.01"
                    {...register('costPerM', { valueAsNumber: true })}
                    className="input input-bordered w-full"
                />
                {errors.costPerM && <p className="text-red-500">{errors.costPerM.message}</p>}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                    type="text"
                    {...register('supplier')}
                    className="input input-bordered w-full"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="stockStatus">Stock Status</Label>
                <SelectField
                    options={Object.values(StockStatus).map(status => ({ value: status, label: status }))}
                    value={watch('stockStatus')}
                    onValueChange={(value) => setValue('stockStatus', value as StockStatus)}
                    placeholder="Select Stock Status"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="expectedDate">Expected Date</Label>
                <Input
                    id="expectedDate"
                    type="date"
                    {...register('expectedDate')}
                    className="input input-bordered w-full"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="orderedDate">Ordered Date</Label>
                <Input
                    id="orderedDate"
                    type="date"
                    {...register('orderedDate')}
                    className="input input-bordered w-full"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="receivedDate">Received Date</Label>
                <Input
                    id="receivedDate"
                    type="date"
                    {...register('receivedDate')}
                    className="input input-bordered w-full"
                />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="notes">Notes</Label>
                <textarea {...register('notes')} className="textarea textarea-bordered w-full" />
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    variant="default"
                    type="submit"
                >
                    {stockId ? 'Update' : 'Add'} Stock
                </Button>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCancel();
                    }}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default OrderItemStockForm;