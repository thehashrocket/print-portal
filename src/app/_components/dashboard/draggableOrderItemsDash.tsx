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

const DraggableOrderItemsDash: React.FC<{ initialOrderItems: SerializedOrderItem[] }> = ({ initialOrderItems }) => {
    // Keep original items separate from filtered view
    const [originalItems] = useState<SerializedOrderItem[]>(initialOrderItems);
    const [displayedItems, setDisplayedItems] = useState<SerializedOrderItem[]>(initialOrderItems);
    const [orderItemNumber, setOrderItemNumber] = useState<string>("");
    const [selectedCompany, setSelectedCompany] = useState<string>("");

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
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <Input
                type="text"
                value={orderItemNumber}
                onChange={handleOrderItemNumberChange}  
                placeholder="Filter by Job Number..."
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

    const calculateDaysUntilDue = (dateString: string): number => {
        const targetDate = new Date(dateString);
        const currentDate = new Date();
        const timeDiff = targetDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    };

    const jobBorderColor = (dateString: string): string => {
        const daysUntilDue = calculateDaysUntilDue(dateString);
        // if the job is due tomorrow then make the border yellow.
        // if the job is due today or is past due then make the border red.
        // if the job is due in more than 7 days then make the border green.
        if (daysUntilDue === 1) {
            return 'yellow';
        } else if (daysUntilDue === 0 || daysUntilDue < 0) {
            return 'red';
        } else {
            return 'green';
        }
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
        <div className="flex flex-col p-5 bg-gray-800 text-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <CompanyFilter />
                <OrderItemNumberFilter />
            </div>
            <div className="flex">
                {allStatuses.map((status) => (
                    <div key={status}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(event) => onDrop(event, status)}
                        className="p-4 mr-4 border border-gray-600 rounded-lg shadow bg-gray-700 transition-colors duration-200 overflow-auto min-w-[200px] min-h-[200px]"
                    >
                        <h3 className="font-semibold mb-2">{status}</h3>
                        {(orderItemsByStatus[status] || []).map(orderItem => (
                            <div key={orderItem.id}
                                data-item-container
                                draggable
                                onDragStart={(event) => onDragStart(event, orderItem.id, orderItem.status)}
                                className="flex-column p-2 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
                                style={{
                                    borderColor: orderItem.expectedDate ? jobBorderColor(orderItem.expectedDate) : undefined,
                                    borderWidth: orderItem.expectedDate ? 3 : 1,
                                    borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
                                }}
                            >
                                <div className='text-sm font-bold mb-2'>{orderItem.Order.Office.Company.name}</div>
                                <div className='text-sm font-bold mb-2'>Job #: {orderItem.orderItemNumber}</div>
                                <div className="text-sm font-medium line-clamp-2 mb-2">{orderItem.description}</div>
                                <div className="flex items-center mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 m-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                    <div className="text-sm">{formatDate(orderItem.expectedDate ?? new Date())}</div>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 m-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                    </svg>
                                    <a href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-blue-400 hover:underline">View Job</a>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DraggableOrderItemsDash;