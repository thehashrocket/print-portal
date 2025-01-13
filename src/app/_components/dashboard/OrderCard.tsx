// ~src/app/_components/dashboard/OrderCard.tsx
import { Building2, CalendarDays, Eye } from 'lucide-react';
import { formatDate } from '~/utils/formatters';
import { type OrderDashboard } from "~/types/orderDashboard";
import { OrderStatus } from '@prisma/client';


const calculateDaysUntilDue = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
};

const jobBorderColor = (dateString: string, status: OrderStatus): string => {
    if (status === OrderStatus.Completed) {
        return 'green';
    }
    const daysUntilDue = calculateDaysUntilDue(dateString);
    if (daysUntilDue === 1) {
        return 'yellow';
    } else if (daysUntilDue <= 0) {
        return 'red';
    } else {
        return 'green';
    }
};

interface OrderCardProps {
    order: OrderDashboard;
    onDragStart: (event: React.DragEvent<HTMLDivElement>, id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDragStart }) => {

    return (
        <div
            key={order.id}
            draggable
            onDragStart={(event) => onDragStart(event, order.id)}
            className="flex-column p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
            style={{
                borderColor: jobBorderColor(order.inHandsDate ?? '', order.status),
                borderWidth: order.inHandsDate ? 3 : 1,
                borderStyle: order.inHandsDate ? 'solid' : 'dashed',
            }}
        >
            <div className='flex mb-3'>
                <Building2 className='w-6 h-6 mr-2' />
                <div className="text-sm font-medium">{order.companyName}</div>
            </div>
            <div className="text-sm font-bold mb-1">Order #: {order.orderNumber}</div>
            <div className="text-sm font-bold mb-1">PO #: {order.purchaseOrderNumber}</div>
            <div className="flex mb-3">
                <CalendarDays className='w-6 h-6 mr-2' />
                <div className="text-sm">{order.inHandsDate ? formatDate(order.inHandsDate) : ''}</div>
            </div>

            {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-3 pl-2 border-l-2 border-gray-500">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="text-sm text-gray-300 mb-1">
                            • {item.orderItemNumber}: {item.status}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center">
                <Eye className='w-6 h-6 mr-2' />
                <a href={`/orders/${order.id}`} className="text-blue-400 hover:underline">View Order</a>
            </div>
        </div>
    );
};

export default OrderCard;
