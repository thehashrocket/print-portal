// ~/app/_components/workOrders/create/workOrderWizard.tsx
"use client";
import React, { useEffect, useContext } from 'react';
import { WorkOrderContext } from '~/app/contexts/workOrderContext';
import WorkOrderItemForm from './workOrderItemForm';
import WorkOrderShippingInfoForm from './workOrderShippingInfoForm';
import { api } from '~/trpc/react';
import { type SerializedWorkOrder } from '~/types/serializedTypes';

const STEPS = ["Basic Information", "Shipping Information", "Estimate Items"];

const StepRail: React.FC<{ current: number }> = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
    {STEPS.map((label, i) => {
      const done = i < current + 1;
      const active = i === current + 1 || i === 0;
      return (
        <React.Fragment key={label}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: done ? "var(--ink)" : "var(--rule)",
              color: done ? "var(--paper)" : "var(--ink-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, fontFamily: "var(--font-jetbrains)",
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{
              fontSize: 11, fontFamily: "var(--font-jetbrains)",
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: done ? "var(--ink)" : "var(--ink-3)",
              whiteSpace: "nowrap",
            }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 1,
              background: i < current + 1 ? "var(--ink)" : "var(--rule)",
              margin: "0 8px", marginBottom: 22,
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const WorkOrderWizard: React.FC<{ workOrderId: string }> = ({ workOrderId }) => {
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
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Shipping Information</h2>
      <WorkOrderShippingInfoForm />
    </>,
    <>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Estimate Items</h2>
      <WorkOrderItemForm />
    </>,
  ];

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 32, color: "var(--danger)" }}>
        Error loading work order. Please try again.
      </div>
    );
  }

  return (
    <div>
      <StepRail current={currentStep} />
      {workOrder ? steps[currentStep] : (
        <div style={{ color: "var(--ink-3)", textAlign: "center", padding: 32 }}>
          No work order data available.
        </div>
      )}
    </div>
  );
};

export default WorkOrderWizard;
