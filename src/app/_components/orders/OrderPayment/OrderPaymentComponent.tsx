'use client';

import React, { useState } from 'react';
import { Order, OrderPayment, PaymentMethod } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { api } from '~/trpc/react';
import { type SerializedOrder, type SerializedOrderPayment } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from "~/utils/formatters";

interface OrderPaymentComponentProps {
    order: SerializedOrder
};

const OrderPaymentComponent: React.FC<OrderPaymentComponentProps> = ({ order }) => {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CreditCard);

    const utils = api.useUtils();
    const addPaymentMutation = api.orderPayments.create.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(order.id);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addPaymentMutation.mutateAsync({
                orderId: order.id,
                amount: parseFloat(amount),
                paymentDate: new Date(),
                paymentMethod,
            });
            setAmount('');
            // Optionally, you can show a success message here
        } catch (error) {
            console.error('Failed to add payment:', error);
            // Optionally, you can show an error message here
        }
    };

    const totalPaid = order.OrderPayments?.reduce((sum, payment) => sum.add(new Decimal(payment.amount)), new Decimal(0)) ?? new Decimal(0);
    const remainingBalance = new Decimal(order.totalAmount?.toString() ?? '0').sub(totalPaid);

    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4">Order Payment</h2>
            <div className="mb-4">
                <p>Order Total: {formatCurrency(order.totalAmount ?? '0')}</p>
                <p>Total Paid: {formatCurrency(totalPaid.toString())}</p>
                <p>Remaining Balance: {formatCurrency(remainingBalance.toString())}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                        Payment Amount
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                        Payment Method
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    >
                        {Object.values(PaymentMethod).map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={addPaymentMutation.isPending}
                >
                    {addPaymentMutation.isPending ? 'Adding Payment...' : 'Add Payment'}
                </button>
            </form>
            <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Payment History</h3>
                <ul>
                    {order.OrderPayments?.map((payment: SerializedOrderPayment) => (
                        <li key={payment.id} className="mb-2">
                            {formatCurrency(payment.amount)} - {payment.paymentMethod} - {formatDate(payment.paymentDate)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrderPaymentComponent;


