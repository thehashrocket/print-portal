
// ~/src/app/_components/invoices/AddPaymentForm.tsx
"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { PaymentMethod } from '@prisma/client';

const paymentSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentDate: z.date(),
    paymentMethod: z.nativeEnum(PaymentMethod),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AddPaymentFormProps {
    invoiceId: string;
    onPaymentAdded: () => void;
}

const AddPaymentForm: React.FC<AddPaymentFormProps> = ({ invoiceId, onPaymentAdded }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentDate: new Date(),
        },
    });

    const addPayment = api.invoices.addPayment.useMutation({
        onSuccess: () => {
            onPaymentAdded();
            reset();
        },
    });

    const onSubmit = (data: PaymentFormData) => {
        addPayment.mutate({ ...data, invoiceId });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="label">Amount</label>
                <input
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="input input-bordered w-full"
                />
                {errors.amount && <span className="text-red-500">{errors.amount.message}</span>}
            </div>

            <div>
                <label className="label">Payment Date</label>
                <input
                    type="date"
                    {...register('paymentDate', { valueAsDate: true })}
                    className="input input-bordered w-full"
                />
                {errors.paymentDate && <span className="text-red-500">{errors.paymentDate.message}</span>}
            </div>

            <div>
                <label className="label">Payment Method</label>
                <select {...register('paymentMethod')} className="select select-bordered w-full">
                    {Object.values(PaymentMethod).map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
                {errors.paymentMethod && <span className="text-red-500">{errors.paymentMethod.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={addPayment.isLoading}>
                {addPayment.isLoading ? 'Adding Payment...' : 'Add Payment'}
            </button>
        </form>
    );
};

export default AddPaymentForm;