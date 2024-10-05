// ~/types/company.ts

export type CompanyDashboardData = {
    id: string;
    name: string;
    workOrderTotalPending: number;
    orderTotalPending: number;
    orderTotalCompleted: number;
    quickbooksId: string;
    syncToken: string;
    createdAt: Date;
    updatedAt: Date;
};