// ~/app_components/workOrders/create/expandableWorkOrderItemDetails.tsx
"user client";
import React from 'react';
import { TypesettingProvider } from '~/app/contexts/TypesettingContext';
import { ProcessingOptionsProvider } from '~/app/contexts/ProcessingOptionsContext';
import TypesettingComponent from '../../shared/typesetting/typesettingComponent';
import ProcessingOptionsComponent from '../../shared/processingOptions/processingOptionsComponent';

interface ExpandableWorkOrderItemDetailsProps {
    itemId: string;
    onClose: () => void;
}

const ExpandableWorkOrderItemDetails: React.FC<ExpandableWorkOrderItemDetailsProps> = ({ itemId, onClose }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Work Order Item Details</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    Close
                </button>
            </div>

            <div className="space-y-6">
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
                    <h4 className="text-lg font-medium mb-2">Processing Options</h4>
                    <ProcessingOptionsProvider>
                        <ProcessingOptionsComponent workOrderItemId={itemId} />
                    </ProcessingOptionsProvider>
                </section>
            </div>
        </div>
    );
};

export default ExpandableWorkOrderItemDetails;