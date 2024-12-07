// ~/src/app/_components/invoices/invoiceForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { InvoiceStatus, Order, OrderItem, Office } from '@prisma/client';
import { SerializedOrder, SerializedOrderItem } from '~/types/serializedTypes';
import { formatCurrency } from '~/utils/formatters';
import { Decimal } from 'decimal.js';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { SelectField } from '../shared/ui/SelectField/SelectField';
import { Input } from '../ui/input';

const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    total: z.number().min(0, 'Total must be non-negative'),
    orderItemId: z.string().optional(),
});

const invoiceSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    dateIssued: z.date(),
    dateDue: z.date(),
    subtotal: z.number().min(0, 'Subtotal must be non-negative'),
    taxRate: z.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%'),
    taxAmount: z.number().min(0, 'Tax amount must be non-negative'),
    total: z.number().min(0, 'Total must be non-negative'),
    status: z.nativeEnum(InvoiceStatus),
    notes: z.string().optional(),
    items: z.array(invoiceItemSchema),
}).refine((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset time to start of day
    return data.dateDue >= today;
}, {
    message: "Due date must be today or in the future",
    path: ["dateDue"],
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const InvoiceForm: React.FC = () => {
    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            dateIssued: new Date(),
            dateDue: new Date(new Date().setDate(new Date().getDate() + 30)),
            status: InvoiceStatus.Draft,
            items: [],
            taxRate: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const createInvoice = api.invoices.create.useMutation();
    const { data: orders } = api.orders.getAll.useQuery();

    const { data: orderItems = [] } = api.orderItems.getByOrderId.useQuery(
        selectedOrderId ?? '',
        {
            enabled: !!selectedOrderId,
        }
    );

    const { data: office } = api.offices.getById.useQuery(selectedOrder?.officeId ?? '', {
        enabled: !!selectedOrder?.officeId,
    });

    const onSubmit = async (data: InvoiceFormData) => {
        try {
            await createInvoice.mutateAsync(data);
            alert('Invoice created successfully');
            reset(); // Reset form after successful submission
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Error creating invoice. Please try again.');
        }
    };

    const calculateTotals = () => {
        const items = watch('items');
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxRate = watch('taxRate') || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        setValue('subtotal', subtotal);
        setValue('taxAmount', taxAmount);
        setValue('total', total);
    };

    useEffect(() => {
        calculateTotals();
    }, [watch('items'), watch('taxRate')]);

    useEffect(() => {
        if (orderItems.length > 0) {
            setValue('items', orderItems.map(item => ({
                description: item.description || '',
                quantity: item.quantity,
                unitPrice: Number(item.amount) || 0,
                total: (Number(item.amount) || 0) * item.quantity,
                orderItemId: item.id,
            })));
        }
    }, [orderItems, setValue]);

    const handleOrderSelect = async (orderId: string) => {
        setValue('orderId', orderId);
        setSelectedOrderId(orderId);
        const order = orders?.find(o => o.id === orderId);
        if (order) {
            setSelectedOrder({
                ...order,
                createdAt: new Date(order.createdAt).toISOString(),
                updatedAt: new Date(order.updatedAt).toISOString(),
                dateInvoiced: order.dateInvoiced ? new Date(order.dateInvoiced).toISOString() : null,
                deposit: order.deposit ? order.deposit.toString() : '',
                inHandsDate: order.inHandsDate ? new Date(order.inHandsDate).toISOString() : null,
                // Remove totalCost from here
            });
            const totalCost = Number(order.totalCost) || 0; // Handle totalCost separately
            // Use totalCost as needed
        } else {
            setSelectedOrder(null);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div >
                <Label htmlFor="orderId">Select Order</Label>
                <SelectField
                    options={orders?.map(order => ({ value: order.id, label: `Order #${order.orderNumber} - ${order.Office.Company.name}` })) || []}
                    value={selectedOrderId || ''}
                    onValueChange={(value) => handleOrderSelect(value)}
                    placeholder="Select an order..."
                    required={true}
                />
                {errors.orderId && <span className="text-red-500">{errors.orderId.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="dateIssued">Date Issued</Label>
                    <Controller
                        name="dateIssued"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="date"
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                className="input input-bordered w-full"
                            />
                        )}
                    />
                    {errors.dateIssued && <span className="text-red-500">{errors.dateIssued.message}</span>}
                </div>
                <div>
                    <Label htmlFor="dateDue">Due Date</Label>
                    <Controller
                        name="dateDue"
                        control={control}
                        render={({ field }) => (
                            <input
                                type="date"
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                className="input input-bordered w-full"
                            />
                        )}
                    />
                    {errors.dateDue && <span className="text-red-500">{errors.dateDue.message}</span>}
                </div>
            </div>

            <div>
                <Label htmlFor="status">Status</Label>
                <SelectField
                    options={Object.values(InvoiceStatus).map(status => ({ value: status, label: status }))}
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as InvoiceStatus)}
                    placeholder="Select Status"
                />
            </div>

            <div>
                <Label htmlFor="items">Items</Label>
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-5 gap-2 mb-2">
                        <Input
                            id="description"
                            {...register(`items.${index}.description`)}
                            placeholder="Description"
                            className="input input-bordered col-span-2"
                        />
                        <Input
                            id="quantity"
                            type="number"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            placeholder="Qty"
                            className="input input-bordered"
                        />
                        <Input
                            id="unitPrice"
                            type="number"
                            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                            placeholder="Price"
                            className="input input-bordered"
                        />
                        <Button
                            variant="destructive"
                            onClick={() => remove(index)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    variant="secondary"
                    onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                >
                    Add Item
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                        id="taxRate"
                        type="number"
                        {...register('taxRate', { valueAsNumber: true })}
                        className="input input-bordered w-full"
                    />
                    {errors.taxRate && <span className="text-red-500">{errors.taxRate.message}</span>}
                </div>
                <div>
                    <Label htmlFor="subtotal">Subtotal</Label>
                    <Input
                        id="subtotal"
                        type="number"
                        {...register('subtotal', { valueAsNumber: true })}
                        readOnly
                        className="input input-bordered w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="taxAmount">Tax Amount</Label>
                    <Input
                        id="taxAmount"
                        type="number"
                        {...register('taxAmount', { valueAsNumber: true })}
                        readOnly
                        className="input input-bordered w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="total">Total</Label>
                    <Input
                        id="total"
                        type="number"
                        {...register('total', { valueAsNumber: true })}
                        readOnly
                        className="input input-bordered w-full"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea {...register('notes')} className="textarea textarea-bordered w-full" />
            </div>

            <div className="flex justify-between">
                <Button
                    variant="default"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => reset()}
                >
                    Reset Form
                </Button>
            </div>

            {selectedOrder && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-semibold mb-2">Selected Order Preview</h3>
                    <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                    <p><strong>Company:</strong> {selectedOrder.Office.Company.name}</p>
                    <p><strong>Total Amount:</strong> {formatCurrency(Number(selectedOrder.totalCost) || 0)}</p>
                </div>
            )}
        </form>
    );
};

export default InvoiceForm;
