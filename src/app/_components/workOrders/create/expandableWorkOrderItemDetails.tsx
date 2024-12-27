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

interface ExpandableWorkOrderItemDetailsProps {
    itemId: string;
    onClose: () => void;
}

const ExpandableWorkOrderItemDetails: React.FC<ExpandableWorkOrderItemDetailsProps> = ({ itemId, onClose }) => {
    const { data: workOrderItem, isLoading, isError } = api.workOrderItems.getByID.useQuery(itemId);

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
        </div>
    );
};

export default ExpandableWorkOrderItemDetails;