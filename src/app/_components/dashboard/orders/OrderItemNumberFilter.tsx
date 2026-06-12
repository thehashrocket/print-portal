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
    <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <input
            className="input"
            type="text"
            value={orderItemNumber}
            onChange={onOrderItemNumberChange}
            placeholder="Filter by Item Number..."
            style={{ width: 240 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary sm" onClick={onSubmit}>Filter</button>
            <button className="btn sm" onClick={onClear}>Clear</button>
        </div>
    </div>
);

export default OrderItemNumberFilter;
