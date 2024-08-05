// ~/src/app/_components/workOrders/WorkOrderCharts.tsx
"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import { WorkOrder } from '@prisma/client'; // Assuming you're using Prisma

// Use dynamic import for the client component
const WorkOrderChartsClient = dynamic(() => import('./WorkOrderChartsClient'), {
    ssr: false, // This component will only be rendered on the client side
});

interface WorkOrderChartsProps {
    workOrders: WorkOrder[]; // Adjust this type if your workOrders have a different structure
}

const WorkOrderCharts: React.FC<WorkOrderChartsProps> = ({ workOrders }) => {
    return <WorkOrderChartsClient workOrders={workOrders} />;
};

export default WorkOrderCharts;