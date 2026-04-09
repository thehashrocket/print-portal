// ~src/app/_components/dashboard/OrderCard.tsx
import { Building2, CalendarDays, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '~/utils/formatters';
import { dueDateBorderColor } from '~/utils/dashboardHelpers';
import { type OrderDashboard } from "~/types/orderDashboard";
import { OrderStatus } from "~/generated/prisma/browser";

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
            className="flex flex-col p-3 mb-2 border rounded-lg cursor-move bg-card text-card-foreground hover:bg-accent hover:shadow-md transition-all duration-200"
            style={{
                borderColor: order.inHandsDate ? dueDateBorderColor(order.inHandsDate, order.status === OrderStatus.Completed) : undefined,
                borderWidth: order.inHandsDate ? 3 : 1,
                borderStyle: order.inHandsDate ? 'solid' : 'dashed',
            }}
        >
            <div className='flex items-center mb-2'>
                <Building2 className='w-5 h-5 mr-2 text-muted-foreground' />
                <div className="text-sm font-semibold truncate">{order.companyName}</div>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs mb-2">
                <span className="text-muted-foreground">Order #</span>
                <span className="font-semibold text-foreground min-w-0 truncate">{order.orderNumber}</span>
                <span className="text-muted-foreground">PO #</span>
                <span className="font-semibold text-foreground min-w-0 truncate">{order.purchaseOrderNumber}</span>
            </div>
            <div className="flex items-center mb-2">
                <CalendarDays className='w-4 h-4 mr-2 text-muted-foreground flex-shrink-0' />
                <span className="text-xs text-muted-foreground">{order.inHandsDate ? formatDate(order.inHandsDate) : 'No date set'}</span>
            </div>

            {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-2 pl-2 border-l-2 border-primary/30 space-y-0.5">
                    {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                            <span>{item.orderItemNumber}</span>
                            <span className="text-muted-foreground/60">{item.status}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center mt-auto pt-2 border-t border-border">
                <Eye className='w-4 h-4 mr-2 text-primary' />
                <Link href={`/orders/${order.id}`} className="text-primary hover:underline text-xs font-medium">View Order</Link>
            </div>
        </div>
    );
};

export default OrderCard;
