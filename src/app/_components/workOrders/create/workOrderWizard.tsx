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

const WorkOrderWizard: React.FC<{ workOrderId: string }> = ({
    workOrderId
}) => {
    const { currentStep, setCurrentStep, workOrder, setWorkOrder } = useContext(WorkOrderContext);

    const { data: returnedWorkOrder, isLoading, isError } = api.workOrders.getByID.useQuery(workOrderId, {
        enabled: !!workOrderId,
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
        </div>
    );
};

export default WorkOrderWizard;