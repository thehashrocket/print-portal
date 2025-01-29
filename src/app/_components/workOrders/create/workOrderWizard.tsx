// ~/app/_components/workOrders/create/workOrderWizard.tsx
"use client";
import React, { useEffect, useContext } from 'react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import WorkOrderItemForm from './workOrderItemForm';
import WorkOrderShippingInfoForm from './workOrderShippingInfoForm';
import { api } from '~/trpc/react';
import Link from "next/link";
import { PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { type SerializedWorkOrder } from '~/types/serializedTypes';
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";

const WorkOrderWizard: React.FC<{ workOrderId: string }> = ({
    workOrderId
}) => {
    const { currentStep, setCurrentStep, workOrder, setWorkOrder } = useContext(WorkOrderContext);

    const { data: returnedWorkOrder, isLoading, isError } = api.workOrders.getByID.useQuery(workOrderId, {
        enabled: !!workOrderId,
    });

    // Add CopilotKit readable context for wizard state
    useCopilotReadable({
        description: "Current work order wizard state and progress",
        value: {
            currentStep,
            totalSteps: 2,
            isLoading,
            isError,
            workOrderId,
        },
    });

    // Add CopilotKit readable context for work order data
    useCopilotReadable({
        description: "Current work order data and completion status",
        value: {
            workOrder,
            hasShippingInfo: !!workOrder?.shippingInfoId,
            hasItems: workOrder?.WorkOrderItems?.length > 0,
        },
    });

    useEffect(() => {
        if (returnedWorkOrder) {
            setWorkOrder(returnedWorkOrder as SerializedWorkOrder);
            if (returnedWorkOrder.shippingInfoId) {
                setCurrentStep(1);
            }
        }
    }, [returnedWorkOrder, setWorkOrder, setCurrentStep]);

    const steps = [
        <>
            <h2 className="text-2xl font-semibold">Shipping Information</h2>
            <WorkOrderShippingInfoForm />
        </>,
        <>
            <h2 className="text-2xl font-semibold">Estimate Items</h2>
            <WorkOrderItemForm />
        </>,
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">Error loading work order. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Estimates</a>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href="/">Home</Link> </li>
                            <li><Link href="/workOrders">Estimates</Link></li>
                            <li><Link href="/workOrders/create">Create Estimate</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex-none">
                    <Link href="/workOrders/create">
                        <Button
                            variant="default"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Estimate
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex justify-center mb-8">
                <div className="steps">
                    <div className={`step step-primary`}>
                        Basic Information
                    </div>
                    <div className={`step ${currentStep >= 0 ? 'step-primary' : ''}`}>
                        Shipping Information
                    </div>
                    <div className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
                        Estimate Items
                    </div>
                </div>
            </div>
            {workOrder ? steps[currentStep] : (
                <div className="text-center text-gray-500">No work order data available.</div>
            )}

            <CopilotPopup
                instructions={`You are an AI assistant helping users navigate the work order creation wizard in a print portal system. You have access to:
                    1. The current wizard step and overall progress
                    2. Work order basic information
                    3. Shipping information status
                    4. Work order items status
                    5. Loading and error states

                    Your role is to:
                    - Guide users through the work order creation workflow
                    - Explain the purpose and requirements of each step
                    - Help users understand what information is needed
                    - Assist with navigation between steps
                    - Explain the relationships between different sections
                    - Help troubleshoot any issues or errors

                    When responding:
                    - Provide step-specific guidance based on the current wizard step
                    - Explain what information is required to complete each step
                    - Help users understand how to proceed to the next step
                    - Clarify the relationships between shipping info and work order items
                    - Guide users on when it's appropriate to finish the process
                    - Explain any validation requirements for completing the work order`}
                labels={{
                    title: "Work Order Creation Guide",
                    initial: "How can I help you with creating your work order?",
                    placeholder: "Ask about steps, requirements, or next actions...",
                }}
            />
        </div>
    );
};

export default WorkOrderWizard;