"use client";
import React, { useState } from "react";
import BasicInfoForm from "./basicInfoForm";


const WorkOrderCreation = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => {
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    return (
        <div>
            {step === 1 && <BasicInfoForm onNext={nextStep} />}
            {/* {step === 2 && <PricingDetailsForm onNext={nextStep} onPrev={prevStep} />} */}
            {/* ... */}
            {/* {step === 7 && <ReviewSubmitForm onPrev={prevStep} />} */}
        </div>
    );
};

export default WorkOrderCreation;