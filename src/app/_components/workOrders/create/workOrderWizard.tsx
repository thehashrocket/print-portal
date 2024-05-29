// ~/app/_components/workOrders/create/WorkOrderWizard.tsx
"use client";
import React, { useState } from 'react';
import WorkOrderForm from './workOrderForm';
import WorkOrderItemForm from './workOrderItemForm';
import ShippingInfoForm from '~/app/_components/shared/shippingInfo/shippingInfoForm';
import TypesettingAndProcessingOptionsForm from './typesettingAndProcessingOptionsForm';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const WorkOrderWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const { loading, error, workOrders } = useWorkOrderContext();

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const currentWorkOrder = workOrders.length > 0 ? workOrders[workOrders.length - 1] : null;

    return (
        <div className="container mx-auto">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {step === 1 && <WorkOrderForm nextStep={nextStep} />}
            {step === 2 && <WorkOrderItemForm nextStep={nextStep} prevStep={prevStep} />}
            {step === 3 && currentWorkOrder && (
                <ShippingInfoForm
                    onSubmit={nextStep}
                    workOrderId={currentWorkOrder.id}
                    officeId={currentWorkOrder.officeId}
                    createdById={currentWorkOrder.createdById}
                />
            )}
            {step === 4 && <TypesettingAndProcessingOptionsForm prevStep={prevStep} />}
            <div className="mt-4 flex justify-between">
                {step > 1 && <button onClick={prevStep} className="btn btn-secondary">Previous</button>}
                {step < 4 && <button onClick={nextStep} className="btn btn-primary">Next</button>}
            </div>
        </div>
    );
};

export default WorkOrderWizard;


