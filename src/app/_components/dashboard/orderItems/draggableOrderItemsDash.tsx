// ~/app/src/_components/dashboard/DraggableOrderItemsDash.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { api } from "~/trpc/react";
import { OrderItemStatus } from '@prisma/client';
import type { OrderItemDashboard } from "~/types/orderItemDashboard";
import { formatDate } from "~/utils/formatters";
import { CustomComboBox } from "~/app/_components/shared/ui/CustomComboBox";
import OrderItemNumberFilter from './OrderItemNumberFilter';
import { Building2, CalendarDays, Eye, Info } from 'lucide-react';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

const calculateDaysUntilDue = (dateString: string): number => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = targetDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
};

const jobBorderColor = (dateString: string, status: OrderItemStatus): string => {
    if (status === OrderItemStatus.Completed) {
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

const DraggableOrderItemsDash: React.FC<{ initialOrderItems: OrderItemDashboard[] }> = ({ initialOrderItems }) => {
    // Keep original items separate from filtered view
    const [originalItems] = useState<OrderItemDashboard[]>(initialOrderItems);
    const [displayedItems, setDisplayedItems] = useState<OrderItemDashboard[]>(initialOrderItems);
    const [orderItemNumber, setOrderItemNumber] = useState<string>("");
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [selectedMobileStatus, setSelectedMobileStatus] = useState<OrderItemStatus>(OrderItemStatus.Prepress);

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

    const CompanyFilter = () => (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <CustomComboBox
                key='1'
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
            event.currentTarget.classList.add('bg-blue-600');
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

    // Add CopilotKit readable context for order items and filtering
    useCopilotReadable({
        description: "Current order items and their statuses in the dashboard",
        value: {
            items: displayedItems.map(item => ({
                id: item.id,
                orderItemNumber: item.orderItemNumber,
                companyName: item.companyName,
                status: item.status,
                totalItems: item.totalItems,
                position: item.position,
            })),
            itemsByStatus: Object.fromEntries(
                Object.entries(orderItemsByStatus).map(([status, items]) => [
                    status,
                    items?.length ?? 0
                ])
            ),
            totalItems: displayedItems.length,
        },
    });

    // Add CopilotKit readable context for filtering state
    useCopilotReadable({
        description: "Current filtering state of the dashboard",
        value: {
            selectedCompany,
            orderItemNumber,
            selectedMobileStatus,
            availableCompanies: companies.map(c => c.label),
            isFiltered: selectedCompany !== "" || orderItemNumber !== "",
        },
    });

    // Add CopilotKit readable context for drag and drop state
    useCopilotReadable({
        description: "Drag and drop functionality state",
        value: {
            availableStatuses: allStatuses,
            canDragAndDrop: true,
            isMobileView: false, // This would need to be updated with actual responsive state
        },
    });

    return (
        <div className="flex flex-col p-2 sm:p-5 bg-gray-800 text-white min-h-screen">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <CompanyFilter />
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
                            JobNumberInList={orderItem.position || 0}
                            jobTotalItems={orderItem.totalItems || 0}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop View: Horizontal columns */}
            <div className="flex items-start gap-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-md mb-4">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-blue-700">
                    Status is the current status of the order item.
                    You can change the status of the order item by dragging and dropping the order item card into a new status.
                    Order items placed in the completed status are not visible in the dashboard after they are completed and the page is refreshed.
                </p>
            </div>
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                {allStatuses.map((status) => (
                    <div key={status}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(event) => onDrop(event, status)}
                        className="flex-1 min-w-[280px] p-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-200px)]"
                    >
                        <h3 className="font-semibold mb-2">{status}</h3>
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

            {/* Add CopilotPopup at the end of the component */}
            <CopilotPopup
                instructions={`You are an AI assistant helping users manage order items in a dashboard view. You have access to:
                    1. All order items and their current statuses
                    2. Filtering options by company and order item number
                    3. Drag and drop functionality for status updates
                    4. Mobile and desktop view states
                    5. Due dates and urgency indicators

                    Your role is to:
                    - Help users understand the current state of orders
                    - Guide users through filtering and finding specific items
                    - Explain the drag and drop functionality
                    - Alert users to urgent or overdue items
                    - Provide insights about workload distribution
                    - Help with status management and updates
                    - Explain mobile vs desktop functionality

                    When responding:
                    - Reference specific items and their details
                    - Explain color coding and urgency indicators
                    - Guide users through status transitions
                    - Help with company and order number filtering
                    - Provide workload insights and suggestions
                    - Alert users to items needing attention
                    - Explain view modes and navigation`}
                labels={{
                    title: "Order Items Dashboard Assistant",
                    initial: "How can I help you manage your order items?",
                    placeholder: "Ask about items, filtering, or status updates...",
                }}
            />
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
        className="flex flex-col p-3 mb-2 border rounded cursor-move bg-gray-600 hover:bg-gray-500 hover:shadow-md transition-all duration-200"
        style={{
            borderColor: orderItem.expectedDate ? jobBorderColor(orderItem.expectedDate.toISOString(), orderItem.status) : undefined,
            borderWidth: orderItem.expectedDate ? 3 : 1,
            borderStyle: orderItem.expectedDate ? 'solid' : 'dashed',
        }}
    >
        <div className='flex items-center mb-2'>
            <Building2 className='w-6 h-6 mr-2' />
            <div className='text-sm font-bold mb-1 truncate'>{orderItem.companyName}</div>
        </div>
        <div className='text-sm font-bold mb-1'>Order #: {orderItem.orderNumber}</div>
        <div className='text-sm font-bold mb-1'>PO #: {orderItem.purchaseOrderNumber}</div>
        <div className='text-sm font-bold mb-1'>Job #: {orderItem.orderItemNumber}</div>
        <div className='text-sm font-bold mb-1'>{orderItem.position} of {orderItem.totalItems} items</div>
        <div className="text-sm font-medium line-clamp-2 mb-2">{orderItem.description}</div>
        
        <div className="flex items-center mb-2">
            <CalendarDays className="w-5 h-5 mr-2" />
            <span className="text-sm">{formatDate(orderItem.expectedDate ?? new Date())}</span>
        </div>
        
        <div className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            <a href={`/orders/${orderItem.orderId}/orderItem/${orderItem.id}`} className="text-blue-400 hover:underline text-sm">
                View Item
            </a>
        </div>
    </div>
);

export default DraggableOrderItemsDash;