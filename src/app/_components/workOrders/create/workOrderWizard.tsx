// ~/app/_components/workOrders/create/WorkOrderWizard.tsx
"use client";
import React, { useState } from 'react';
import WorkOrderForm from './workOrderForm';
import WorkOrderItemForm from './workOrderItemForm';
import TypesettingAndProcessingOptionsForm from './typesettingAndProcessingOptionsForm';
import ShippingInfoForm from '~/app/_components/shared/shippingInfo/shippingInfoForm';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const WorkOrderWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const { loading, error, workOrderId, setWorkOrderId } = useWorkOrderContext();

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="container mx-auto">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {step === 1 && <WorkOrderForm nextStep={nextStep} />}
            {step === 2 && <ShippingInfoForm onSubmit={nextStep} />}
            {step === 3 && <WorkOrderItemForm nextStep={nextStep} prevStep={prevStep} />}
            {step === 4 && <TypesettingAndProcessingOptionsForm prevStep={prevStep} />}
            <div>
                {step > 1 && <button onClick={prevStep} className="btn btn-secondary">Previous</button>}
                {step < 4 && <button onClick={nextStep} className="btn btn-primary">Next</button>}
            </div>
        </div>
    );
};

export default WorkOrderWizard;