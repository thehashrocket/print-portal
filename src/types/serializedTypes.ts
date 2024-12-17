// ~/types/serializedTypes.ts

import {
    type AddressType,
    type BindingType,
    type InvoicePrintEmailOptions,
    type InvoiceStatus,
    type OrderStatus,
    type OrderItemStatus,
    type PaymentMethod,
    type ProofMethod,
    type ShippingMethod,
    type StockStatus,
    type TypesettingStatus,
    type WorkOrderItemStatus,
    type WorkOrderStatus,
} from "@prisma/client";

export interface SerializedAddress {
    addressType: AddressType;
    city: string;
    country: string;
    createdAt: string;
    deleted: boolean;
    id: string;
    line1: string;
    line2: string | null;
    line3: string | null;
    line4: string | null;
    officeId: string;
    quickbooksId: string | null;
    state: string;
    telephoneNumber: string;
    updatedAt: string;
    zipCode: string;
}

export interface SerializedCompany {
    id: string;
    name: string;
    isActive: boolean;
    quickbooksId: string | null;
    Offices: SerializedOffice[];
}

export interface SerializedInvoice {
    createdAt: string;
    createdById: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string | null;
    };
    dateDue: string;
    dateIssued: string;
    id: string;
    InvoiceItems: SerializedInvoiceItem[];
    invoiceNumber: string;
    InvoicePayments: SerializedInvoicePayment[];
    notes: string | null;
    Order: {
        Office: {
            Company: { name: string };
        };
    };
    orderId: string;
    quickbooksId: string | null;
    syncToken: string | null;
    status: InvoiceStatus;
    subtotal: string;
    taxAmount: string;
    taxRate: string;
    total: string;
    updatedAt: string;
}

export interface SerializedInvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
    invoiceId: string;
    orderItemId: string | null;
}

export interface SerializedInvoicePayment {
    id: string;
    amount: string;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    invoiceId: string;
}

export interface SerializedOffice {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    companyId: string;
    isActive: boolean;
    name: string;
    quickbooksCustomerId: string | null;
    Addresses: SerializedAddress[];
    Company: {
        name: string;
    }
    WorkOrders: SerializedWorkOrder[];
    Orders: SerializedOrder[];
}

export interface SerializedOrder {
    balance: string | null;
    calculatedSalesTax: string | null;
    calculatedSubTotal: string | null;
    contactPersonId: string;
    createdAt: string;
    createdById: string;
    dateInvoiced: string | null;
    deposit: string;
    id: string;
    inHandsDate: string | null;
    invoicePrintEmail: InvoicePrintEmailOptions;
    officeId: string;
    orderNumber: number;
    pressRun: string | null;
    quickbooksInvoiceId: string | null;
    shippingInfoId: string | null;
    status: OrderStatus;
    syncToken: string | null;
    totalAmount: string | null;
    totalCost: string | null;
    totalItemAmount: string | null;
    totalPaid: string | null;
    totalShippingAmount: string | null;
    updatedAt: string;
    version: number;
    workOrderId: string;
    WorkOrder: {
        purchaseOrderNumber: string;
    };
    contactPerson: {
        id: string;
        name: string | null;
        email: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    Office: {
        Company: {
            name: string;
        };
    };
    Invoice: SerializedInvoice | null;
    OrderItems: SerializedOrderItem[];
    OrderNotes: SerializedOrderNote[];
    OrderPayments: SerializedOrderPayment[] | null;
    ShippingInfo: SerializedShippingInfo | null;
}

export interface SerializedOrderItem {
    id: string;
    amount: string | null;
    cost: string | null;
    createdAt: string;
    createdById: string;
    description: string;
    expectedDate: string | null;
    finishedQty: number;
    ink: string | null;
    Order: {
        Office: {
            Company: {
                name: string;
            };
        };
        WorkOrder: {
            purchaseOrderNumber: string;
        };
    };
    orderId: string;
    orderItemNumber: number;
    other: string | null;
    prepTime: number | null;
    pressRun: string;
    quantity: number;
    shippingAmount: string | null;
    size: string | null;
    specialInstructions: string | null;
    status: OrderItemStatus;
    updatedAt: string;
    artwork: SerializedOrderItemArtwork[];
    OrderItemStock: SerializedOrderItemStock[];
}

export interface SerializedOrderItemArtwork {
    id: string;
    orderItemId: string;
    fileUrl: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SerializedOrderItemStock {
    costPerM: string;
    createdAt: string;
    createdById: string;
    expectedDate: string | null;
    from: string | null;
    id: string;
    notes: string | null;
    orderedDate: string | null;
    orderItemId: string;
    received: boolean;
    receivedDate: string | null;
    stockQty: number;
    stockStatus: StockStatus;
    supplier: string | null;
    totalCost: string | null;
    updatedAt: string;
}

export interface SerializedOrderNote {
    id: string;
    note: string;
    orderId: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
}

export interface SerializedOrderPayment {
    id: string;
    amount: string;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    orderId: string;
}

export interface SerializedProcessingOptions {
    id: string;
    cutting: string | null;
    padding: string | null;
    drilling: string | null;
    folding: string | null;
    other: string | null;
    numberingStart: number | null;
    numberingEnd: number | null;
    numberingColor: string | null;
    createdAt: string;
    updatedAt: string;
    orderItemId: string | null;
    workOrderItemId: string | null;
    createdById: string;
    description: string;
    name: string;
    stitching: string | null;
    binderyTime: number | null;
    binding: BindingType | null;
}

export interface SerializedShippingInfo {
    id: string;
    shippingMethod: ShippingMethod;
    instructions: string | null;
    shippingCost: string | null;
    shippingDate: string | null;
    shippingNotes: string | null;
    shippingOther: string | null;
    shipToSameAsBillTo: boolean;
    estimatedDelivery: string | null;
    numberOfPackages: number | null;
    trackingNumber: string | null;
    attentionTo: string | null;
    addressId: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    officeId: string;
    Address: SerializedAddress | null;
    ShippingPickup: SerializedShippingPickup | null;
}

export interface SerializedShippingPickup {
    id: string;
    pickupDate: string;
    pickupTime: string;
    notes: string | null;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
    shippingInfoId: string;
}

export interface SerializedTypesetting {
    id: string;
    approved: boolean;
    cost: string | null;
    createdAt: string;
    createdById: string;
    dateIn: string;
    followUpNotes: string | null;
    orderItemId: string | null;
    plateRan: string | null;
    prepTime: number | null;
    status: TypesettingStatus;
    timeIn: string;
    updatedAt: string;
    workOrderItemId: string | null;
    TypesettingOptions: SerializedTypesettingOption[];
    TypesettingProofs: SerializedTypesettingProof[];
}

export interface SerializedTypesettingOption {
    id: string;
    typesettingId: string;
    option: string;
    selected: boolean;
    createdAt: string;
    createdById: string;
    updatedAt: string;
}

export interface SerializedTypesettingProof {
    id: string;
    typesettingId: string;
    proofNumber: number;
    dateSubmitted: Date | null;
    notes: string | null;
    approved: boolean | null;
    createdAt: Date;
    createdById: string;
    updatedAt: Date;
    proofCount: number;
    proofMethod: ProofMethod;
    artwork: SerializedTypesettingProofArtwork[];
}

export interface SerializedTypesettingProofArtwork {
    id: string;
    typesettingProofId: string;
    fileUrl: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SerializedWorkOrder {
    calculatedSalesTax: string | null;
    calculatedSubTotal: string | null;
    contactPersonId: string;
    createdAt: string;
    createdById: string;
    dateIn: string;
    estimateNumber: string;
    id: string;
    inHandsDate: string;
    invoicePrintEmail: InvoicePrintEmailOptions;
    officeId: string;
    purchaseOrderNumber: string;
    shippingInfoId: string | null;
    status: WorkOrderStatus;
    totalAmount: string | null;
    totalCost: string | null;
    totalItemAmount: string | null;
    totalShippingAmount: string | null;
    updatedAt: string;
    version: number;
    workOrderNumber: string;
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    Office: {
        Company: {
            name: string;
        };
        id: string;
        name: string;
    };
    Order: {
        id: string;
    } | null;
    ShippingInfo: SerializedShippingInfo | null;
    WorkOrderItems: SerializedWorkOrderItem[];
    WorkOrderNotes: SerializedWorkOrderNote[];
    WorkOrderVersions: SerializedWorkOrderVersion[];
}

export interface SerializedWorkOrderItem {
    id: string;
    amount: string | null;
    cost: string | null;
    createdAt: string;
    createdById: string;
    description: string;
    expectedDate: string;
    ink: string | null;
    other: string | null;
    quantity: number;
    size: string | null;
    specialInstructions: string | null;
    status: WorkOrderItemStatus;
    updatedAt: string;
    workOrderId: string | null;
    artwork: SerializedWorkOrderItemArtwork[];
    ProcessingOptions: SerializedProcessingOptions[];
    Typesetting: SerializedTypesetting[];
    workOrderItemNumber: number;
    WorkOrderItemStock: SerializedWorkOrderItemStock[];
    createdBy: {
        id: string;
        name: string | null;
    };
}

export interface SerializedWorkOrderItemArtwork {
    id: string;
    workOrderItemId: string;
    fileUrl: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SerializedWorkOrderItemStock {
    costPerM: string;
    createdAt: string;
    createdById: string;
    expectedDate: string | null;
    from: string | null;
    id: string;
    notes: string | null;
    orderedDate: string | null;
    received: boolean;
    receivedDate: string | null;
    stockQty: number;
    stockStatus: StockStatus;
    supplier: string | null;
    totalCost: string | null;
    updatedAt: string;
    workOrderItemId: string;
}

export interface SerializedWorkOrderNote {
    id: string;
    workOrderId: string;
    note: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
}

export interface SerializedWorkOrderVersion {
    id: string;
    workOrderId: string;
    version: number;
    createdBy: string;
    createdAt: string;
}