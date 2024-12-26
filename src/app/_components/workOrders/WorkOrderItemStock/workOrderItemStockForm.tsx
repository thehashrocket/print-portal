// ~/app/_components/shared/workOrderItemStock/workOrderItemStockForm.tsx
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '~/trpc/react';
import { StockStatus } from '@prisma/client';
import { Button } from '~/app/_components/ui/button';
import { SelectField } from '~/app/_components/shared/ui/SelectField/SelectField';
import { Input } from '~/app/_components/ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { CustomComboBox } from '../../../_components/shared/ui/CustomComboBox';
// Define the schema based on Prisma types
const workOrderItemStockSchema = z.object({
    stockQty: z.number().int().positive(),
    costPerM: z.number().positive(),
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
    onSuccess: () => void;
    onCancel: () => void;
}

const WorkOrderItemStockForm: React.FC<WorkOrderItemStockFormProps> = ({
    workOrderItemId,
    stockId,
    onSuccess,
    onCancel
}) => {
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<WorkOrderItemStockFormData>({
        resolver: zodResolver(workOrderItemStockSchema),
        defaultValues: {
            workOrderItemId,
            received: false,
            stockStatus: StockStatus.OnHand,
        },
    });

    console.log("Form errors:", errors);
    console.log("Is form submitting?", isSubmitting);

    const { data: existingStock } = api.workOrderItemStocks.getByID.useQuery(
        stockId as string,
        { enabled: !!stockId }
    );

    const { data: paperProducts } = api.paperProducts.getAll.useQuery();

    const createStock = api.workOrderItemStocks.create.useMutation({
        onSuccess: () => {
            console.log("Stock created successfully");
            onSuccess();
            reset();
        },
        onError: (error) => {
            console.error("Error creating stock:", error);
        }
    });

    const updateStock = api.workOrderItemStocks.update.useMutation({
        onSuccess: () => {
            console.log("Stock updated successfully");
            onSuccess();
        },
        onError: (error) => {
            console.error("Error updating stock:", error);
        }
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
        console.log("Form submitted with data:", data);
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
        <form onSubmit={(e) => {
            e.preventDefault();
            console.log("Form native submit event triggered");
            handleSubmit(onSubmit)(e);
        }} className="space-y-4">

            <div>
                <Label>
                    Paper Product
                </Label>
                {/* Provide a list of PaperProducts to select from using SelectField */}
                {paperProducts && (
                    <CustomComboBox
                        options={paperProducts.map((paperProduct) => ({ value: paperProduct.id, label: paperProduct.brand + ' ' + paperProduct.size + ' ' + paperProduct.paperType + ' ' + paperProduct.finish }))}
                        value={watch('paperProductId') ?? ''}
                        onValueChange={(value: string) => setValue('paperProductId', value)}
                        placeholder="Select paper product..."
                        emptyText="No paper products found"
                        searchPlaceholder="Search paper products..."
                        className="w-full"
                    />
                )}
            </div>
            <div>
                <Label>
                    Quantity
                </Label>
                <Input type="number" {...register('stockQty', { valueAsNumber: true })} />
                {errors.stockQty && <p className="text-red-500">{errors.stockQty.message}</p>}
            </div>

            <div>
                <Label>
                    Cost Per M
                </Label>
                <Input type="number" step="0.01" {...register('costPerM', { valueAsNumber: true })} />
                {errors.costPerM && <p className="text-red-500">{errors.costPerM.message}</p>}
            </div>

            <div>
                <Label>
                    Supplier
                </Label>
                <Input {...register('supplier')} />
            </div>

            <div>
                <Label>
                    Stock Status
                </Label>
                <SelectField
                    options={Object.values(StockStatus).map((status) => ({ value: status, label: status }))}
                    value={watch('stockStatus')}
                    onValueChange={(value: string) => setValue('stockStatus', value as StockStatus)}
                    placeholder="Select stock status..."
                    required={true}
                />
            </div>

            <div>
                <Label>
                    Expected Date
                </Label>
                <Input type="date" {...register('expectedDate')} />
            </div>

            <div>
                <Label>
                    Ordered Date
                </Label>
                <Input type="date" {...register('orderedDate')} />
            </div>

            <div>
                <Label>
                    Received
                </Label>
                <input type="checkbox" {...register('received')} className="checkbox" />
            </div>

            <div>
                <Label>
                    Received Date
                </Label>
                <Input type="date" {...register('receivedDate')} />
            </div>

            <div>
                <Label>
                    Notes
                </Label>
                <Textarea {...register('notes')} />
            </div>

            <div className="flex justify-end space-x-2">
                <Button
                    type="submit"
                    variant="default"
                >
                    {stockId ? 'Update' : 'Add'} Stock
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

export default WorkOrderItemStockForm;