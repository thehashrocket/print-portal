import React from 'react';

interface OrderItemNumberFilterProps {
    orderItemNumber: string;
    onOrderItemNumberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClear: () => void;
}

const OrderItemNumberFilter: React.FC<OrderItemNumberFilterProps> = ({
    orderItemNumber,
    onOrderItemNumberChange,
    onSubmit,
    onClear
}) => (
    <div className="card p-3 flex flex-col gap-2">
        <input
            className="input w-60"
            type="text"
            value={orderItemNumber}
            onChange={onOrderItemNumberChange}
            placeholder="Filter by Item Number..."
        />
        <div className="flex gap-2">
            <button className="btn primary sm" onClick={onSubmit}>Filter</button>
            <button className="btn sm" onClick={onClear}>Clear</button>
        </div>
    </div>
);

export default OrderItemNumberFilter;
