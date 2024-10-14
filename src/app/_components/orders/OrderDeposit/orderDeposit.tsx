"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { formatCurrency } from "~/utils/formatters";
import { type SerializedOrder } from "~/types/serializedTypes";

interface OrderDepositProps {
    order: SerializedOrder;
}

const OrderDeposit: React.FC<OrderDepositProps> = ({ order }) => {
    const [deposit, setDeposit] = useState(order.deposit ?? "");
    const [isEditing, setIsEditing] = useState(false);
    const utils = api.useUtils();
    const { mutate: updateDeposit, isPending } = api.orders.updateDeposit.useMutation({
        onSuccess: () => {
            utils.orders.getByID.invalidate(order.id);
            setIsEditing(false);
        },
        onError: (error) => {
            console.error('Failed to update deposit:', error);
            // Optionally, you can show an error message to the user here
        }
    });

    const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeposit(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateDeposit({ id: order.id, data: { deposit: parseFloat(deposit) } });
    };

    return (
        <div className="mb-4 border-2 border-gray-300 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Deposit</h3>
            {isEditing ? (
                <form onSubmit={handleSubmit} className="flex items-center">
                    <input
                        type="number"
                        step="0.01"
                        value={deposit}
                        onChange={handleDepositChange}
                        className="border rounded px-2 py-1 mr-2"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isPending ? "Updating..." : "Update"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <div className="flex items-center">
                    <span className="mr-2">{formatCurrency(order.deposit ?? "")}</span>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderDeposit;
