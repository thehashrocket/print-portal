// ~/types/serializedTypes.ts

import {
    AddressType,
    BindingType,
    InvoicePrintEmailOptions,
    InvoiceStatus,
    OrderStatus,
    OrderItemStatus,
    PaymentMethod,
    ProofMethod,
    ShippingMethod,
    StockStatus,
    TypesettingStatus,
    WorkOrderItemStatus,
    WorkOrderStatus,
} from "@prisma/client";

export interface SerializedAddress {
    id: string;
    officeId: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    telephoneNumber: string;
    addressType: AddressType;
    createdAt: string;
    updatedAt: string;
}

export interface SerializedInvoice {
    id: string;
    invoiceNumber: string;
    dateIssued: string;
    dateDue: string;
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    total: string;
    status: InvoiceStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    createdById: string;
    InvoiceItems: SerializedInvoiceItem[];
    InvoicePayments: SerializedInvoicePayment[];
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

export interface SerializedOrder {
    contactPersonId: string;
    calculatedSalesTax: string | null;
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
    shippingInfoId: string | null;
    status: OrderStatus;
    totalAmount: string | null;
    totalCost: string | null;
    totalItemAmount: string | null;
    totalShippingAmount: string | null;
    updatedAt: string;
    version: number;
    workOrderId: string;
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
    };
    OrderItems: SerializedOrderItem[];
    ShippingInfo: SerializedShippingInfo | null;
    Invoice: SerializedInvoice | null;
    OrderNotes: SerializedOrderNote[];
}

export interface SerializedOrderItem {
    id: string;
    amount: string | null;
    cost: string | null;
    createdAt: string;
    createdById: string;
    customerSuppliedStock: string;
    description: string;
    expectedDate: string | null;
    finishedQty: number;
    ink: string | null;
    orderId: string;
    other: string | null;
    prepTime: number | null;
    pressRun: string;
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
    id: string;
    stockQty: number;
    costPerM: string;
    totalCost: string | null;
    from: string | null;
    expectedDate: string | null;
    orderedDate: string | null;
    received: boolean;
    receivedDate: string | null;
    notes: string | null;
    stockStatus: StockStatus;
    createdAt: string;
    updatedAt: string;
    orderItemId: string;
    createdById: string;
    supplier: string | null;
    workOrderItemId: string;
}

export interface SerializedOrderNote {
    id: string;
    note: string;
    orderId: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
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
    dateSubmitted: string | null;
    notes: string | null;
    approved: boolean | null;
    createdAt: string;
    createdById: string;
    updatedAt: string;
    proofCount: number;
    proofMethod: ProofMethod;
}

export interface SerializedWorkOrder {
    id: string;
    officeId: string;
    dateIn: string;
    inHandsDate: string;
    estimateNumber: string;
    purchaseOrderNumber: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    workOrderNumber: number;
    shippingInfoId: string | null;
    status: WorkOrderStatus;
    totalAmount: string | null;
    totalCost: string | null;
    totalItemAmount: string | null;
    totalShippingAmount: string | null;
    invoicePrintEmail: InvoicePrintEmailOptions;
    contactPersonId: string;
    createdById: string;
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
    customerSuppliedStock: string | null;
    description: string;
    expectedDate: string;
    ink: string | null;
    other: string | null;
    prepTime: number | null;
    shippingAmount: string | null;
    size: string | null;
    specialInstructions: string | null;
    status: WorkOrderItemStatus;
    updatedAt: string;
    workOrderId: string | null;
    artwork: SerializedWorkOrderItemArtwork[];
    ProcessingOptions: SerializedProcessingOptions[];
    Typesetting: SerializedTypesetting[];
    WorkOrderItemStock: SerializedWorkOrderItemStock[];
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
    id: string;
    stockQty: number;
    costPerM: string;
    totalCost: string | null;
    from: string | null;
    expectedDate: string | null;
    orderedDate: string | null;
    received: boolean;
    receivedDate: string | null;
    notes: string | null;
    stockStatus: StockStatus;
    createdAt: string;
    updatedAt: string;
    workOrderItemId: string;
    createdById: string;
    supplier: string | null;
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