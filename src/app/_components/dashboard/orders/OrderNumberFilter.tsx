import React from 'react';

interface OrderNumberFilterProps {
    orderNumber: string;
    onOrderNumberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClear: () => void;
}

const OrderNumberFilter: React.FC<OrderNumberFilterProps> = ({
    orderNumber,
    onOrderNumberChange,
    onSubmit,
    onClear
}) => (
    <div className="card p-3 flex flex-col gap-2">
        <input
            className="input w-60"
            type="text"
            value={orderNumber}
            onChange={onOrderNumberChange}
            placeholder="Filter by Order Number..."
        />
        <div className="flex gap-2">
            <button className="btn primary sm" onClick={onSubmit}>Filter</button>
            <button className="btn sm" onClick={onClear}>Clear</button>
        </div>
    </div>
);

export default OrderNumberFilter;
