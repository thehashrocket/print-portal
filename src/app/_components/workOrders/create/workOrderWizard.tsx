// ~/app/_components/workOrders/create/workOrderWizard.tsx
"use client";
import React, { useState } from 'react';
import WorkOrderForm from './workOrderForm';
import WorkOrderItemForm from './workOrderItemForm';
import TypesettingAndProcessingOptionsForm from './typesettingAndProcessingOptionsForm';
import { useWorkOrderContext } from '~/app/contexts/workOrderContext';

const WorkOrderWizard: React.FC = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div>
            {step === 1 && <WorkOrderForm />}
            {step === 2 && <WorkOrderItemForm />}
            {step === 3 && <TypesettingAndProcessingOptionsForm />}
            <div>
                {step > 1 && <button onClick={prevStep}>Previous</button>}
                {step < 3 && <button onClick={nextStep}>Next</button>}
            </div>
        </div>
    );
};

export default WorkOrderWizard;
