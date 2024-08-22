// ~/src/types/workOrder.ts
import { WorkOrderStatus } from "@prisma/client";

// ~/src/types/workOrder.ts
export type SerializedWorkOrder = {
    createdAt: string;
    createdBy: {
        id: string;
        name: string | null;
    };
    createdById: string;
    dateIn: string;
    estimateNumber: string;
    id: string;
    inHandsDate: string;
    Office: { id: string; name: string; Company: { name: string } };
    officeId: string;
    Order?: { id: string } | null;
    purchaseOrderNumber: string;
    shippingInfoId: string | null | undefined;
    totalCost: string | null | undefined;
    updatedAt: string;
    version: number;
    WorkOrderItems?: { id: string; workOrderId: string | null; finishedQty: number | null; other: string | null; pressRun: string | null; customerSuppliedStock: string | null }[];
    status: WorkOrderStatus;
    workOrderNumber: string;
};
