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
    <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <input
            className="input"
            type="text"
            value={orderNumber}
            onChange={onOrderNumberChange}
            placeholder="Filter by Order Number..."
            style={{ width: 240 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary sm" onClick={onSubmit}>Filter</button>
            <button className="btn sm" onClick={onClear}>Clear</button>
        </div>
    </div>
);

export default OrderNumberFilter;
