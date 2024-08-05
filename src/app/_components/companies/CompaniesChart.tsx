// ~/src/app/_components/companies/CompaniesChart.tsx
"use client";

import React from 'react';
import { AgCharts } from 'ag-charts-react';
import { Company } from '@prisma/client';
import { AgChartOptions, AgBarSeriesOptions } from 'ag-charts-community';

interface ExtendedCompany extends Company {
    workOrderTotalPending: number;
    orderTotalPending: number;
}

interface CompaniesChartProps {
    companies: ExtendedCompany[];
}

const CompaniesChart: React.FC<CompaniesChartProps> = ({ companies }) => {
    const chartData = companies.map(company => ({
        name: company.name,
        pendingWorkOrders: company.workOrderTotalPending,
        pendingOrders: company.orderTotalPending,
    }));

    const chartOptions: AgChartOptions = {
        title: {
            text: 'Pending Work Orders and Orders by Company'
        },
        data: chartData,
        series: [{
            type: 'bar',
            xKey: 'name',
            yKey: 'pendingWorkOrders',
            yName: 'Pending Work Orders'
        } as AgBarSeriesOptions, {
            type: 'bar',
            xKey: 'name',
            yKey: 'pendingOrders',
            yName: 'Pending Orders'
        } as AgBarSeriesOptions],
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
                formatter: (params: { value: number }) => {
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