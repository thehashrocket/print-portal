// ~/src/app/_components/invoices/AddPaymentForm.tsx
"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { PaymentMethod } from '@prisma/client';
import { Button } from '../ui/button';
import { SelectField } from '../shared/ui/SelectField/SelectField';
import { Label } from '../ui/label';

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
    const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<PaymentFormData>({
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
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <SelectField
                    options={Object.values(PaymentMethod).map(method => ({ value: method, label: method }))}
                    value={watch('paymentMethod') || ''}
                    onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}
                    placeholder="Select payment method..."
                    required={true}
                />
                {errors.paymentMethod && <span className="text-red-500">{errors.paymentMethod.message}</span>}
            </div>

            <Button
                type="submit"
                variant="default"
                className="btn btn-primary w-full"
            >
                Add Payment
            </Button>
        </form>
    );
};

export default AddPaymentForm;