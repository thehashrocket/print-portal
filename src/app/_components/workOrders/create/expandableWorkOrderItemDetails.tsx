// ~/app_components/workOrders/create/expandableWorkOrderItemDetails.tsx
"user client";
import React from 'react';
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import { ProcessingOptionsProvider } from '~/app/contexts/ProcessingOptionsContext';
import TypesettingComponent from '../../shared/typesetting/typesettingComponent';
import ProcessingOptionsComponent from '../../shared/processingOptions/processingOptionsComponent';
import WorkOrderItemStockComponent from '../../workOrders/WorkOrderItemStock/workOrderItemStockComponent';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

interface ExpandableWorkOrderItemDetailsProps {
    itemId: string;
    onClose: () => void;
}

const ExpandableWorkOrderItemDetails: React.FC<ExpandableWorkOrderItemDetailsProps> = ({ itemId, onClose }) => {
    const { data: workOrderItem, isLoading, isError } = api.workOrderItems.getByID.useQuery(itemId);

    // Add CopilotKit readable context for work order item details
    useCopilotReadable({
        description: "Current work order item details and specifications",
        value: {
            itemDetails: workOrderItem ? {
                id: workOrderItem.id,
                description: workOrderItem.description,
                productType: workOrderItem.ProductType?.name,
                status: workOrderItem.status,
                quantity: workOrderItem.quantity,
                amount: workOrderItem.amount,
            } : null,
            isLoading,
            isError,
        },
    });

    // Add CopilotKit readable context for processing options and typesetting
    useCopilotReadable({
        description: "Work order item processing and typesetting information",
        value: {
            hasProcessingOptions: (workOrderItem?.ProcessingOptions ?? []).length > 0,
            hasTypesetting: (workOrderItem?.Typesetting ?? []).length > 0,
            hasStockInfo: (workOrderItem?.WorkOrderItemStock ?? []).length > 0,
            processingOptionsCount: workOrderItem?.ProcessingOptions?.length ?? 0,
            typesettingCount: workOrderItem?.Typesetting?.length ?? 0,
            stockCount: workOrderItem?.WorkOrderItemStock?.length ?? 0,
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isError || !workOrderItem) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">Error loading work order item details. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Item Details</h3>
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>

            <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Product Type</h4>
                <p>{workOrderItem.ProductType?.name ?? 'N/A'}</p>
            </div>
            
            <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Description</h4>
                <p>{workOrderItem.description}</p>
            </div>

            <div className="space-y-6">
                <section>
                    <h4 className="text-lg font-medium mb-2">Bindery Options</h4>
                    <ProcessingOptionsProvider>
                        <ProcessingOptionsComponent workOrderItemId={itemId} />
                    </ProcessingOptionsProvider>
                </section>
                <section>
                    <h4 className="text-lg font-medium mb-2">Typesetting Options</h4>
                    <TypesettingProvider>
                        <TypesettingComponent
                            workOrderItemId={itemId}
                            orderItemId=""
                            initialTypesetting={[]}
                        />
                    </TypesettingProvider>
                </section>
                <section>
                    <h4 className="text-lg font-medium mb-2">Stock Information</h4>
                    <WorkOrderItemStockComponent workOrderItemId={itemId} />
                </section>
            </div>

            <CopilotPopup
                instructions={`You are an AI assistant helping users understand and manage work order item details in a print portal system. You have access to:
                    1. Complete work order item specifications
                    2. Product type and description
                    3. Bindery and processing options
                    4. Typesetting specifications
                    5. Stock information and requirements

                    Your role is to:
                    - Help users understand the item specifications
                    - Explain bindery and processing options
                    - Guide users through typesetting requirements
                    - Assist with stock information management
                    - Explain relationships between different specifications

                    When responding:
                    - Reference specific details from the current item
                    - Explain technical terms and specifications
                    - Help users understand processing requirements
                    - Guide users through typesetting options
                    - Assist with stock selection and management
                    - Explain how different options affect the final product`}
                labels={{
                    title: "Work Order Item Details Assistant",
                    initial: "How can I help you understand this item's specifications?",
                    placeholder: "Ask about specifications, options, or requirements...",
                }}
            />
        </div>
    );
};

export default ExpandableWorkOrderItemDetails;