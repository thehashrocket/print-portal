"use client"
import React from 'react';
import dynamic from 'next/dynamic';

import WorkOrderChartsClient from './WorkOrderChartsClient';

const WorkOrderCharts = ({ workOrders }) => {
    return <WorkOrderChartsClient workOrders={workOrders} />;
};

export default WorkOrderCharts;