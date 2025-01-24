import React from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

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
    <div className="w-full md:w-auto mb-4 p-4 bg-gray-700 rounded-lg">
        <Input
            type="text"
            value={orderItemNumber}
            onChange={onOrderItemNumberChange}  
            placeholder="Filter by Item Number..."
            className="w-[300px] mb-2"
        />
        <div className="flex gap-2">
            <Button variant="default" onClick={onSubmit}>Filter</Button>
            <Button variant="outline" onClick={onClear}>Clear</Button>
        </div>
    </div>
);

export default OrderItemNumberFilter;