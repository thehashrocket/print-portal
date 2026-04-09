// ~/app/src/_components/dashboard/DraggableOrderItemsDash.tsx

"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from "~/trpc/react";
import { OrderItemStatus } from "~/generated/prisma/browser";
import type { OrderItemDashboard } from "~/types/orderItemDashboard";
import { formatDate } from "~/utils/formatters";
import { dueDateBorderColor } from "~/utils/dashboardHelpers";
import { CustomComboBox } from "~/app/_components/shared/ui/CustomComboBox";
import OrderItemNumberFilter from './OrderItemNumberFilter';
import { Building2, CalendarDays, Eye, Info, X } from 'lucide-react';


interface CompanyFilterProps {
    companies: { value: string; label: string }[];
    selectedCompany: string;
    onCompanyChange: (value: string) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({ companies, selectedCompany, onCompanyChange }) => (
    <div className="mb-4 p-4 bg-muted border border-border rounded-lg">
        <CustomComboBox
            key='1'
            options={[{ value: "", label: "All Companies" }, ...companies]}
            value={selectedCompany}
            onValueChange={onCompanyChange}
            placeholder="Filter by Company..."
            emptyText="No companies found"
            searchPlaceholder="Search companies..."
            className="w-[300px]"
        />
    </div>
);

const DraggableOrderItemsDash: React.FC<{ initialOrderItems: OrderItemDashboard[] }> = ({ initialOrderItems }) => {
    // Keep original items separate from filtered view
    const [originalItems] = useState<OrderItemDashboard[]>(initialOrderItems);
    const [displayedItems, setDisplayedItems] = useState<OrderItemDashboard[]>(initialOrderItems);
    const [orderItemNumber, setOrderItemNumber] = useState<string>("");
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [selectedMobileStatus, setSelectedMobileStatus] = useState<OrderItemStatus>(OrderItemStatus.Prepress);
    const [showBanner, setShowBanner] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem('dashboard-order-items-banner-dismissed') !== '1';
    });

    const updateOrderItemStatus = api.orderItems.updateStatus.useMutation();

    // Extract unique companies from original items
    const companies = useMemo(() => {
        const uniqueCompanies = new Set(
            originalItems.map(item => item.companyName)
        );
        return Array.from(uniqueCompanies).map(name => ({
            value: name,
            label: name,
        }));
    }, [originalItems]);

    // Handle company selection
    const handleCompanyChange = (companyName: string) => {
        setSelectedCompany(companyName);
        if (companyName) {
            const filtered = originalItems.filter(
                item => item.companyName === companyName
            );
            setDisplayedItems(filtered);
        } else {
            setDisplayedItems(originalItems);
        }
    };



    const handleOrderItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderItemNumber(event.target.value);
    };

    const handleOrderItemNumberSubmit = () => {
        if (!orderItemNumber.trim()) {
            setDisplayedItems(originalItems);
            return;
        }
        const filtered = originalItems.filter(
            item => item.orderItemNumber.toString().includes(orderItemNumber.trim())
        );
        setDisplayedItems(filtered);
    };

    const clearOrderItemNumberFilter = () => {
        setOrderItemNumber("");
        setDisplayedItems(originalItems);
    };

    // Your existing helper functions

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove('bg-accent');
    }

    // First, add position tracking to the dragged items
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, id: string, status: OrderItemStatus) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ id, status }));
    };

    const onDrop = async (event: React.DragEvent<HTMLDivElement>, newStatus: OrderItemStatus) => {
        event.preventDefault();
        event.currentTarget.classList.remove('bg-accent');

        // Get the drop target
        const dropTarget = event.target as HTMLElement;
        const itemContainer = dropTarget.closest('[data-item-container]') as HTMLElement;

        try {
            const { id, status: oldStatus } = JSON.parse(event.dataTransfer.getData("text/plain"));

            // If the status hasn't changed, find the drop position within the same column
            if (oldStatus === newStatus && itemContainer) {
                const items = [...displayedItems];
                const draggedItemIndex = items.findIndex(item => item.id === id);
                if (draggedItemIndex === -1) return;  // Exit if item not found

                const draggedItem = items[draggedItemIndex] as OrderItemDashboard;
                items.splice(draggedItemIndex, 1);

                // Find the drop target's index
                const dropIndex = Array.from(itemContainer.parentElement?.children || [])
                    .indexOf(itemContainer);
                if (dropIndex === -1) return;  // Exit if drop position not found

                // Insert the item at the new position
                items.splice(dropIndex, 0, draggedItem);

                setDisplayedItems(items);
            } else {
                // Update status and move to top of new column
                await updateOrderItemStatus.mutateAsync({ id, status: newStatus });

                const updatedItems = displayedItems.map(item => {
                    if (item.id === id) {
                        return { ...item, status: newStatus } as OrderItemDashboard;
                    }
                    return item;
                });

                // Sort the items so the newly moved item appears at the top of its new status
                const sortedItems = updatedItems.sort((a, b) => {
                    if (a.id === id) return -1;
                    if (b.id === id) return 1;
                    if (a.status === b.status) return 0;
                    return 0;
                });

                setDisplayedItems(sortedItems);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const dropTarget = event.target as HTMLElement;
        const itemContainer = dropTarget.closest('[data-item-container]');

        // Remove existing drop indicators
        document.querySelectorAll('.drop-indicator').forEach(el =>
            el.classList.remove('drop-indicator'));

        if (itemContainer) {
            itemContainer.classList.add('drop-indicator');
        } else {
            event.currentTarget.classList.add('bg-accent');
        }
    };

    const allStatuses = [
        OrderItemStatus.Prepress,
        OrderItemStatus.Press,
        OrderItemStatus.Bindery,
        OrderItemStatus.Hold,
        OrderItemStatus.Shipping,
        OrderItemStatus.Completed,
    ];

    // Group the displayed items by status
    const orderItemsByStatus = displayedItems.reduce((acc, orderItem) => {
        const statusGroup = acc[orderItem.status] || [];
        acc[orderItem.status] = [...statusGroup, orderItem];
        return acc;
    }, {} as { [key in OrderItemStatus]?: OrderItemDashboard[] });

    return (
        <div className="flex flex-col p-2 sm:p-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <CompanyFilter
                    companies={companies}
                    selectedCompany={selectedCompany}
                    onCompanyChange={handleCompanyChange}
                />
                <OrderItemNumberFilter
                    orderItemNumber={orderItemNumber}
                    onOrderItemNumberChange={handleOrderItemNumberChange}
                    onSubmit={handleOrderItemNumberSubmit}
                    onClear={clearOrderItemNumberFilter}
                />
            </div>

            {/* Mobile View: Vertical tabs for status columns */}
            <div className="block md:hidden mb-4">
                <select
                    className="w-full p-2 bg-muted border border-border rounded-lg"
                    value={selectedMobileStatus}
                    onChange={(e) => setSelectedMobileStatus(e.target.value as OrderItemStatus)}
                >
                    {allStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <div className="mt-4">
                    {(orderItemsByStatus[selectedMobileStatus as OrderItemStatus] || []).map(orderItem => (
                        <JobCard
                            key={orderItem.id}
                            orderItem={orderItem}
                            onDragStart={onDragStart}
                            JobNumberInList={orderItem.position || 0}
                            jobTotalItems={orderItem.totalItems || 0}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop View: Horizontal columns */}
            {showBanner && (
                <div className="hidden md:flex items-start gap-2 p-3 text-sm bg-muted border border-border rounded-md mb-4">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground flex-1">
                        Drag and drop order item cards between columns to update their status.
                        Completed items are hidden after page refresh.
                    </p>
                    <button type="button" aria-label="Dismiss" onClick={() => { localStorage.setItem('dashboard-order-items-banner-dismissed', '1'); setShowBanner(false); }} className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-1 flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                {allStatuses.map((status) => (
                    <div key={status}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(event) => onDrop(event, status)}
                        className="flex-1 min-w-[280px] p-4 border border-border rounded-lg shadow-sm bg-muted transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-200px)]"
                    >
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                            <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">{status}</h3>
                            <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                {(orderItemsByStatus[status] || []).length}
                            </span>
                        </div>
                        {(orderItemsByStatus[status] || []).map(orderItem => (
                            <JobCard
                                key={orderItem.id}
                                orderItem={orderItem}
                                onDragStart={onDragStart}
                                JobNumberInList={orderItem.position || 0}
                                jobTotalItems={orderItem.totalItems || 0}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Create a separate JobCard component for better organization
interface JobCardProps {
    orderItem: OrderItemDashboard;
    onDragStart: (event: React.DragEvent<HTMLDivElement>, id: string, status: OrderItemStatus) => void;
    JobNumberInList: number; // The number of the job in the list
    jobTotalItems: number; // The total number of items in the job
}

const JobCard: React.FC<JobCardProps> = ({ orderItem, onDragStart }) => (
    <div
        data-item-container
        draggable
        onDragStart={(event) => onDragStart(event, orderItem.id, orderItem.status)}
        className="flex flex-col p-3 mb-2 border rounded-lg cursor-move bg-card text-card-foreground hover:bg-accent hover:shadow-md transition-all duration-200"
        style={{
            borderColor: orderItem.expectedDate ? dueDateBorderColor(orderItem.expectedDate.toISOString(), orderItem.status === OrderItemStatus.Completed) : undefined,
            borderWidth: orderItem.expectedDate ? 3 : 1,
            borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
        }}
    >
        <div className='flex items-center mb-2'>
            <Building2 className='w-5 h-5 mr-2 text-muted-foreground' />
            <div className='text-sm font-semibold truncate'>{orderItem.companyName}</div>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs mb-1">
            <span className="text-muted-foreground">Order #</span>
            <span className="font-semibold text-foreground min-w-0 truncate">{orderItem.orderNumber}</span>
            <span className="text-muted-foreground">PO #</span>
            <span className="font-semibold text-foreground min-w-0 truncate">{orderItem.purchaseOrderNumber}</span>
            <span className="text-muted-foreground">Job #</span>
            <span className="font-semibold text-foreground min-w-0 truncate">{orderItem.orderItemNumber}</span>
        </div>
        <div className='text-xs text-muted-foreground mb-1'>{orderItem.position} of {orderItem.totalItems} items</div>
        <div className="text-sm line-clamp-2 mb-2">{orderItem.description}</div>

        <div className="flex items-center mb-2">
            <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-xs">{orderItem.expectedDate ? formatDate(orderItem.expectedDate) : 'No date set'}</span>
        </div>

        <div className="flex items-center mt-auto pt-2 border-t border-border">
            <Eye className="w-4 h-4 mr-2 text-primary" />
            <Link href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-primary hover:underline text-xs font-medium">
                View Item
            </Link>
        </div>
    </div>
);

export default DraggableOrderItemsDash;
