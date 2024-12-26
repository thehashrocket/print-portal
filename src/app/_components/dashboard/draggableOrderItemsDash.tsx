// ~/app/src/_components/dashboard/DraggableOrderItemsDash.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { api } from "~/trpc/react";
import { OrderItemStatus } from '@prisma/client';
import type { SerializedOrderItem } from "~/types/serializedTypes";
import { formatDate } from "~/utils/formatters";
import { useCopilotReadable } from "@copilotkit/react-core";
import { CustomComboBox } from "~/app/_components/shared/ui/CustomComboBox";
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const calculateDaysUntilDue = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
};

const jobBorderColor = (dateString: string): string => {
    const daysUntilDue = calculateDaysUntilDue(dateString);
    if (daysUntilDue === 1) {
        return 'yellow';
    } else if (daysUntilDue <= 0) {
        return 'red';
    } else {
        return 'green';
    }
};

const DraggableOrderItemsDash: React.FC<{ initialOrderItems: SerializedOrderItem[] }> = ({ initialOrderItems }) => {
    // Keep original items separate from filtered view
    const [originalItems] = useState<SerializedOrderItem[]>(initialOrderItems);
    const [displayedItems, setDisplayedItems] = useState<SerializedOrderItem[]>(initialOrderItems);
    const [orderItemNumber, setOrderItemNumber] = useState<string>("");
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [selectedMobileStatus, setSelectedMobileStatus] = useState<OrderItemStatus>(OrderItemStatus.Prepress);

    const updateOrderItemStatus = api.orderItems.updateStatus.useMutation();

    // Extract unique companies from original items
    const companies = useMemo(() => {
        const uniqueCompanies = new Set(
            originalItems.map(item => item.Order.Office.Company.name)
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
                item => item.Order.Office.Company.name === companyName
            );
            setDisplayedItems(filtered);
        } else {
            setDisplayedItems(originalItems);
        }
    };

    const CompanyFilter = () => (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <CustomComboBox
                options={[{ value: "", label: "All Companies" }, ...companies]}
                value={selectedCompany}
                onValueChange={handleCompanyChange}
                placeholder="Filter by Company..."
                emptyText="No companies found"
                searchPlaceholder="Search companies..."
                className="w-[300px]"
            />
        </div>
    );

    const handleOrderItemNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrderItemNumber(event.target.value);
    };

    const handleOrderItemNumberSubmit = () => {
        const filtered = originalItems.filter(
            item => item.orderItemNumber.toString().includes(orderItemNumber)
        );
        setDisplayedItems(filtered);
    };

    const clearOrderItemNumberFilter = () => {
        setOrderItemNumber("");
        setDisplayedItems(originalItems);
    };

    const OrderItemNumberFilter = () => (
        <div className="w-full md:w-auto mb-4 p-4 bg-gray-700 rounded-lg">
            <Input
                type="text"
                value={orderItemNumber}
                onChange={handleOrderItemNumberChange}  
                placeholder="Filter by Item Number..."
                className="w-[300px] mb-2"
            />
            <div className="flex gap-2">
                <Button variant="default" onClick={handleOrderItemNumberSubmit}>Filter</Button>
                <Button variant="outline" onClick={clearOrderItemNumberFilter}>Clear</Button>
            </div>
        </div>
    );

    // Your existing helper functions
    const isWithinAWeek = (dateString: string): boolean => {
        const targetDate = new Date(dateString);
        const currentDate = new Date();
        const timeDiff = targetDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff <= 7;
    };

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.currentTarget.classList.remove('bg-blue-600');
    }

    // First, add position tracking to the dragged items
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, id: string, status: OrderItemStatus) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ id, status }));
    };

    const onDrop = async (event: React.DragEvent<HTMLDivElement>, newStatus: OrderItemStatus) => {
        event.preventDefault();
        event.currentTarget.classList.remove('bg-blue-600');

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

                const draggedItem = items[draggedItemIndex] as SerializedOrderItem;
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
                        return { ...item, status: newStatus } as SerializedOrderItem;
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
            event.currentTarget.classList.add('bg-blue-600');
        }
    };

    const allStatuses = [
        OrderItemStatus.Prepress,
        OrderItemStatus.Press,
        OrderItemStatus.Bindery,
        OrderItemStatus.Shipping,
        OrderItemStatus.Completed,
    ];

    // Group the displayed items by status
    const orderItemsByStatus = displayedItems.reduce((acc, orderItem) => {
        const statusGroup = acc[orderItem.status] || [];
        acc[orderItem.status] = [...statusGroup, orderItem];
        return acc;
    }, {} as { [key in OrderItemStatus]?: SerializedOrderItem[] });

    return (
        <div className="flex flex-col p-2 sm:p-5 bg-gray-800 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <CompanyFilter />
                <OrderItemNumberFilter />
            </div>
            
            {/* Mobile View: Vertical tabs for status columns */}
            <div className="block md:hidden mb-4">
                <select 
                    className="w-full p-2 bg-gray-700 rounded-lg"
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
                        />
                    ))}
                </div>
            </div>

            {/* Desktop View: Horizontal columns */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                {allStatuses.map((status) => (
                    <div key={status}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(event) => onDrop(event, status)}
                        className="flex-1 min-w-[280px] p-4 border border-gray-600 rounded-lg shadow bg-gray-700 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-200px)]"
                    >
                        <h3 className="font-semibold mb-2">{status}</h3>
                        {(orderItemsByStatus[status] || []).map(orderItem => (
                            <JobCard 
                                key={orderItem.id}
                                orderItem={orderItem}
                                onDragStart={onDragStart}
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
    orderItem: SerializedOrderItem;
    onDragStart: (event: React.DragEvent<HTMLDivElement>, id: string, status: OrderItemStatus) => void;
}

const JobCard: React.FC<JobCardProps> = ({ orderItem, onDragStart }) => (
    <div
        data-item-container
        draggable
        onDragStart={(event) => onDragStart(event, orderItem.id, orderItem.status)}
        className="flex flex-col p-3 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
        style={{
            borderColor: orderItem.expectedDate ? jobBorderColor(orderItem.expectedDate) : undefined,
            borderWidth: orderItem.expectedDate ? 3 : 1,
            borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
        }}
    >
        <div className='text-sm font-bold mb-1 truncate'>{orderItem.Order.Office.Company.name}</div>
        <div className='text-sm font-bold mb-1'>Job #: {orderItem.orderItemNumber}</div>
        <div className="text-sm font-medium line-clamp-2 mb-2">{orderItem.description}</div>
        
        <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="text-sm">{formatDate(orderItem.expectedDate ?? new Date())}</span>
        </div>
        
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <a href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-blue-400 hover:underline text-sm">
                View Item
            </a>
        </div>
    </div>
);

export default DraggableOrderItemsDash;