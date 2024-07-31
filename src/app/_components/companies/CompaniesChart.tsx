"use client";

import React from 'react';
import { AgCharts } from 'ag-charts-react';
import { Company } from '@prisma/client';

interface CompaniesChartProps {
    companies: Company[];
}

const CompaniesChart: React.FC<CompaniesChartProps> = ({ companies }) => {
    const chartData = companies.map(company => ({
        name: company.name,
        pendingWorkOrders: parseFloat(company.workOrderTotalPending),
        pendingOrders: parseFloat(company.orderTotalPending),
    }));

    const chartOptions = {
        title: {
            text: 'Pending Work Orders and Orders by Company'
        },
        data: chartData,
        series: [{
            type: 'bar',
            xKey: 'name',
            yKey: 'pendingWorkOrders',
            yName: 'Pending Work Orders'
        }, {
            type: 'bar',
            xKey: 'name',
            yKey: 'pendingOrders',
            yName: 'Pending Orders'
        }],
        legend: {
            position: 'bottom'
        },
        axes: [{
            type: 'category',
            position: 'bottom'
        }, {
            type: 'number',
            position: 'left',
            label: {
                formatter: (params) => {
                    return '$' + params.value.toLocaleString();
                }
            }
        }]
    };

    return (
        <div className="h-96 w-full">
            <AgCharts options={chartOptions} />
        </div>
    );
};

export default CompaniesChart;