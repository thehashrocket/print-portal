// ~/src/types/workOrder.ts
import { WorkOrderStatus } from "@prisma/client";

export type SerializedWorkOrder = {
    createdAt: string;
    dateIn: string;
    id: string;
    Order?: {
        id: string;
    } | null;
    purchaseOrderNumber: string;
    status: WorkOrderStatus;
    totalCost: string | null;
    updatedAt: string;
    workOrderNumber: string;
};
