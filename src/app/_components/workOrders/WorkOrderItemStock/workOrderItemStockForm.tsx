// ~/app/_components/shared/workOrderItemStock/workOrderItemStockForm.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { PaperType, StockStatus } from '@prisma/client';
import { Button } from '~/app/_components/ui/button';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { Input } from '~/app/_components/ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { CustomComboBox } from '../../../_components/shared/ui/CustomComboBox';
import { type TempWorkOrderItemStock } from '~/app/store/workOrderItemStockStore';
import { PaperProductDialog } from '~/app/_components/shared/paperProducts/paperProductDialog';
import { formatPaperProductLabel } from '~/utils/formatters';
// Define the schema based on Prisma types
const workOrderItemStockSchema = z.object({
    stockQty: z.number().int().positive(),
    costPerM: z.number().default(0),
    totalCost: z.number().optional(),
    from: z.string().optional(),
    expectedDate: z.string().optional(),
    orderedDate: z.string().optional(),
    paperProductId: z.string().optional(),
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
    onSuccess: (stockData: TempWorkOrderItemStock) => void;
    onCancel: () => void;
    isTemporary?: boolean;
}

const WorkOrderItemStockForm: React.FC<WorkOrderItemStockFormProps> = ({
    workOrderItemId,
    stockId,
    onSuccess,
    onCancel,
    isTemporary = false
}) => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<WorkOrderItemStockFormData>({
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

    const createStock = api.workOrderItemStocks.create.useMutation({
        onSuccess: () => {
            console.log("Stock created successfully");
            onSuccess({} as TempWorkOrderItemStock);
            reset();
        },
        onError: (error) => {
            console.error("Error creating stock:", error);
        }
    });

    const updateStock = api.workOrderItemStocks.update.useMutation({
        onSuccess: () => {
            console.log("Stock updated successfully");
            onSuccess({} as TempWorkOrderItemStock);
        },
        onError: (error) => {
            console.error("Error updating stock:", error);
        }
    });

    const utils = api.useUtils();

    const handlePaperProductCreated = (paperProduct: { id: string }) => {
        setValue('paperProductId', paperProduct.id);
        utils.paperProducts.getAll.invalidate();
    };

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
                paperProductId: existingStock.paperProductId || undefined,
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
            expectedDate: data.expectedDate ? new Date(data.expectedDate + 'T12:00:00') : undefined,
            orderedDate: data.orderedDate ? new Date(data.orderedDate + 'T12:00:00') : undefined,
            receivedDate: data.receivedDate ? new Date(data.receivedDate + 'T12:00:00') : undefined,
            from: data.from || undefined,
            supplier: data.supplier || undefined,
            notes: data.notes || undefined,
        };

        if (isTemporary) {
            onSuccess({
                stockQty: data.stockQty,
                costPerM: data.costPerM,
                totalCost: data.totalCost,
                from: data.from,
                expectedDate: data.expectedDate ? new Date(data.expectedDate + 'T12:00:00') : undefined,
                orderedDate: data.orderedDate ? new Date(data.orderedDate + 'T12:00:00') : undefined,
                paperProductId: data.paperProductId,
                received: data.received,
                receivedDate: data.receivedDate ? new Date(data.receivedDate + 'T12:00:00') : undefined,
                notes: data.notes,
                stockStatus: data.stockStatus,
                supplier: data.supplier,
            });
            return;
        }

        if (stockId) {
            updateStock.mutate({
                id: stockId,
                data: formattedData
            });
        } else {
            createStock.mutate(formattedData);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Paper Product</Label>
                <div className="space-y-2">
                    {uniquePaperProducts && (
                        <div className="flex flex-row gap-2">
                            <SelectField
                                options={(
                                    Object.values(PaperType).map((paperType) => ({
                                        value: paperType,
                                        label: paperType
                                    }))
                                )}
                                value={selectedPaperType ?? ''}
                                onValueChange={(value) => {
                                    setSelectedPaperType(value as PaperType);
                                }}
                                placeholder="Select paper type..."
                            />
                            <SelectField
                                options={(paperProductsByType ?? []).map((paperProduct) => ({
                                    value: paperProduct.id,
                                    label: formatPaperProductLabel(paperProduct)
                                }))}
                                value={watch('paperProductId') ?? ''}
                                onValueChange={(value) => setValue('paperProductId', value)}
                                placeholder={isPaperProductsLoading ? "Loading..." : "Select paper product..."}
                                disabled={!selectedPaperType || isPaperProductsLoading}
                            />
                        </div>
                    )}
                    <PaperProductDialog onPaperProductCreated={handlePaperProductCreated} />
                </div>
            </div>

            <div>
                <Label>Quantity</Label>
                <Input type="number" {...register('stockQty', { valueAsNumber: true })} />
                {errors.stockQty && <span className="text-red-500 block">{errors.stockQty.message}</span>}
            </div>

            <div>
                <Label>Cost Per M</Label>
                <Input
                    type="number"
                    defaultValue={0}
                    step="0.01"
                    {...register('costPerM', { valueAsNumber: true })}
                    placeholder="Enter cost per meter..."
                />
                {errors.costPerM && <span className="text-red-500 block">{errors.costPerM.message}</span>}
            </div>

            <div>
                <Label>Supplier</Label>
                <Input {...register('supplier')} />
            </div>

            <div>
                <Label>Stock Status</Label>
                <SelectField
                    options={Object.values(StockStatus).map((status) => ({ value: status, label: status }))}
                    value={watch('stockStatus')}
                    onValueChange={(value: string) => setValue('stockStatus', value as StockStatus)}
                    placeholder="Select stock status..."
                    required={true}
                />
            </div>

            <div>
                <Label>Expected Date</Label>
                <Input type="date" {...register('expectedDate')} />
            </div>

            <div>
                <Label>Ordered Date</Label>
                <Input type="date" {...register('orderedDate')} />
            </div>

            <div>
                <Label>Received</Label>
                <input type="checkbox" {...register('received')} className="checkbox" />
            </div>

            <div>
                <Label>Received Date</Label>
                <Input type="date" {...register('receivedDate')} />
            </div>

            <div>
                <Label>Notes</Label>
                <Textarea {...register('notes')} />
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    type="submit"
                    variant="default"
                    onClick={(e) => e.stopPropagation()}
                >
                    {stockId ? 'Update' : 'Add'} Stock
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default WorkOrderItemStockForm;