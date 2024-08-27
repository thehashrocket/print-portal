// ~/utils/dataNormalization.ts

import {
    Order,
    OrderItem,
    WorkOrder,
    WorkOrderItem,
    ShippingInfo,
    ShippingPickup,
    Address,
    ProcessingOptions,
    Typesetting,
    TypesettingOption,
    TypesettingProof,
    WorkOrderItemArtwork,
    WorkOrderItemStock,
    Invoice,
    InvoiceItem,
    InvoicePayment,
    OrderItemArtwork,
    OrderItemStock,
    OrderNote,
    WorkOrderNote,
    WorkOrderVersion,
    Prisma
} from "@prisma/client";

import {
    SerializedOrder,
    SerializedOrderItem,
    SerializedWorkOrder,
    SerializedWorkOrderItem,
    SerializedShippingInfo,
    SerializedShippingPickup,
    SerializedProcessingOptions,
    SerializedTypesetting,
    SerializedTypesettingOption,
    SerializedTypesettingProof,
    SerializedWorkOrderItemArtwork,
    SerializedWorkOrderItemStock,
    SerializedAddress,
    SerializedInvoice,
    SerializedInvoiceItem,
    SerializedInvoicePayment,
    SerializedOrderItemArtwork,
    SerializedOrderItemStock,
    SerializedOrderNote,
    SerializedWorkOrderNote,
    SerializedWorkOrderVersion
} from "~/types/serializedTypes";

export function normalizeInvoiceItem(item: InvoiceItem): SerializedInvoiceItem {
    return {
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
        invoiceId: item.invoiceId,
        orderItemId: item.orderItemId,
    };
}

export function normalizeInvoicePayment(payment: InvoicePayment): SerializedInvoicePayment {
    return {
        id: payment.id,
        amount: payment.amount.toString(),
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        invoiceId: payment.invoiceId,
    };
}

export function normalizeOrder(order: Order & {
    totalAmount: Prisma.Decimal | null;
    totalCost: Prisma.Decimal | null;
    Office: {
        Company: { name: string };
    };
    OrderItems?: (OrderItem & {
        artwork: OrderItemArtwork[];
        OrderItemStock: OrderItemStock[];
    })[];
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: {
        id: string;
        name: string | null;
    };
    ShippingInfo?: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    Invoice?: (Invoice & {
        InvoiceItems: InvoiceItem[];
        InvoicePayments: InvoicePayment[];
    }) | null;
    OrderNotes?: OrderNote[];
}): SerializedOrder {
    return {
        id: order.id,
        status: order.status,
        workOrderId: order.workOrderId,
        orderNumber: order.orderNumber,
        deposit: order.deposit.toString(),
        version: order.version,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippingInfoId: order.shippingInfoId,
        dateInvoiced: order.dateInvoiced?.toISOString() ?? null,
        inHandsDate: order.inHandsDate?.toISOString() ?? null,
        invoicePrintEmail: order.invoicePrintEmail,
        createdById: order.createdById,
        contactPersonId: order.contactPersonId,
        officeId: order.officeId,
        totalAmount: order.totalAmount ? order.totalAmount.toString() : null,
        totalCost: order.totalCost ? order.totalCost.toString() : null,
        pressRun: order.pressRun,
        contactPerson: {
            id: order.contactPerson.id,
            name: order.contactPerson.name
        },
        createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name
        },
        Office: {
            Company: {
                name: order.Office.Company.name
            }
        },
        OrderItems: order.OrderItems ? order.OrderItems.map(normalizeOrderItem) : [],
        ShippingInfo: order.ShippingInfo ? normalizeShippingInfo(order.ShippingInfo) : null,
        Invoice: order.Invoice ? normalizeInvoice(order.Invoice) : null,
        OrderNotes: order.OrderNotes ? order.OrderNotes.map(normalizeOrderNote) : []
    };
}

export function normalizeOrderItem(item: OrderItem & {
    artwork: OrderItemArtwork[];
    OrderItemStock: OrderItemStock[];
}): SerializedOrderItem {
    return {
        id: item.id,
        amount: item.amount ? item.amount.toString() : null,
        cost: item.cost ? item.cost.toString() : null,
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
        customerSuppliedStock: item.customerSuppliedStock,
        description: item.description,
        expectedDate: item.expectedDate ? item.expectedDate.toISOString() : null,
        finishedQty: item.finishedQty,
        ink: item.ink,
        orderId: item.orderId,
        other: item.other,
        prepTime: item.prepTime,
        pressRun: item.pressRun,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        artwork: item.artwork.map(normalizeOrderItemArtwork),
        OrderItemStock: item.OrderItemStock.map(normalizeOrderItemStock)
    };
}


export function normalizeOrderItemArtwork(artwork: OrderItemArtwork): SerializedOrderItemArtwork {
    return {
        id: artwork.id,
        orderItemId: artwork.orderItemId,
        fileUrl: artwork.fileUrl,
        description: artwork.description,
        createdAt: artwork.createdAt.toISOString(),
        updatedAt: artwork.updatedAt.toISOString(),
    };
}

export function normalizeOrderItemStock(stock: OrderItemStock): SerializedOrderItemStock {
    return {
        id: stock.id,
        stockQty: stock.stockQty,
        costPerM: stock.costPerM.toString(),
        totalCost: stock.totalCost?.toString() ?? null,
        from: stock.from,
        expectedDate: stock.expectedDate?.toISOString() ?? null,
        orderedDate: stock.orderedDate?.toISOString() ?? null,
        received: stock.received,
        receivedDate: stock.receivedDate?.toISOString() ?? null,
        notes: stock.notes,
        stockStatus: stock.stockStatus,
        createdAt: stock.createdAt.toISOString(),
        updatedAt: stock.updatedAt.toISOString(),
        orderItemId: stock.orderItemId,
        createdById: stock.createdById,
        supplier: stock.supplier,
        workOrderItemId: stock.workOrderItemId
    };
}

export function normalizeOrderNote(note: OrderNote): SerializedOrderNote {
    return {
        id: note.id,
        note: note.note,
        orderId: note.orderId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        createdById: note.createdById
    };
}

export function normalizeWorkOrder(workOrder: WorkOrder & {
    totalAmount: Prisma.Decimal | null;
    totalCost: Prisma.Decimal | null;
    Order: { id: string } | null;
    WorkOrderItems: (WorkOrderItem & {
        artwork: WorkOrderItemArtwork[];
        ProcessingOptions: ProcessingOptions[];
        Typesetting: (Typesetting & {
            TypesettingOptions: TypesettingOption[];
            TypesettingProofs: TypesettingProof[];
        })[];
        WorkOrderItemStock: WorkOrderItemStock[];
    })[];
    contactPerson: {
        id: string;
        name: string | null;
    };
    createdBy: { id: string; name: string | null };
    Office: {
        id: string;
        name: string;
        Company: {
            name: string;
        }
    };
    ShippingInfo: (ShippingInfo & {
        Address: Address | null;
        ShippingPickup: ShippingPickup[];
    }) | null;
    WorkOrderNotes: WorkOrderNote[];
    WorkOrderVersions: WorkOrderVersion[];
}): SerializedWorkOrder {
    return {
        id: workOrder.id,
        officeId: workOrder.officeId,
        dateIn: workOrder.dateIn.toISOString(),
        inHandsDate: workOrder.inHandsDate.toISOString(),
        estimateNumber: workOrder.estimateNumber,
        purchaseOrderNumber: workOrder.purchaseOrderNumber,
        version: workOrder.version,
        createdAt: workOrder.createdAt.toISOString(),
        updatedAt: workOrder.updatedAt.toISOString(),
        workOrderNumber: workOrder.workOrderNumber,
        shippingInfoId: workOrder.shippingInfoId,
        status: workOrder.status,
        invoicePrintEmail: workOrder.invoicePrintEmail,
        contactPersonId: workOrder.contactPersonId,
        createdById: workOrder.createdById,
        totalAmount: workOrder.totalAmount ? workOrder.totalAmount.toString() : null,
        totalCost: workOrder.totalCost ? workOrder.totalCost.toString() : null,
        contactPerson: {
            id: workOrder.contactPerson.id,
            name: workOrder.contactPerson.name
        },
        createdBy: {
            id: workOrder.createdBy.id,
            name: workOrder.createdBy.name
        },
        Office: {
            Company: {
                name: workOrder.Office.Company.name
            },
            id: workOrder.Office.id,
            name: workOrder.Office.name
        },
        Order: workOrder.Order,
        WorkOrderItems: workOrder.WorkOrderItems.map(normalizeWorkOrderItem),
        ShippingInfo: workOrder.ShippingInfo ? normalizeShippingInfo(workOrder.ShippingInfo) : null,
        WorkOrderNotes: workOrder.WorkOrderNotes.map(normalizeWorkOrderNote),
        WorkOrderVersions: workOrder.WorkOrderVersions.map(normalizeWorkOrderVersion)
    };
}

export function normalizeWorkOrderItem(item: WorkOrderItem & {
    artwork: WorkOrderItemArtwork[];
    ProcessingOptions: ProcessingOptions[];
    Typesetting: (Typesetting & {
        TypesettingOptions: TypesettingOption[];
        TypesettingProofs: TypesettingProof[];
    })[];
    WorkOrderItemStock: WorkOrderItemStock[];
}): SerializedWorkOrderItem {
    return {
        id: item.id,
        amount: item.amount?.toString() ?? null,
        cost: item.cost?.toString() ?? null,
        createdAt: item.createdAt.toISOString(),
        createdById: item.createdById,
        customerSuppliedStock: item.customerSuppliedStock,
        description: item.description,
        expectedDate: item.expectedDate.toISOString(),
        ink: item.ink,
        other: item.other,
        prepTime: item.prepTime,
        size: item.size,
        specialInstructions: item.specialInstructions,
        status: item.status,
        updatedAt: item.updatedAt.toISOString(),
        workOrderId: item.workOrderId,
        artwork: item.artwork.map(normalizeWorkOrderItemArtwork),
        ProcessingOptions: item.ProcessingOptions.map(normalizeProcessingOptions),
        Typesetting: item.Typesetting.map(normalizeTypesetting),
        WorkOrderItemStock: item.WorkOrderItemStock.map(normalizeWorkOrderItemStock),
    };
}

export function normalizeShippingInfo(shippingInfo: ShippingInfo & {
    Address: Address | null;
    ShippingPickup: ShippingPickup[];
}): SerializedShippingInfo {
    return {
        id: shippingInfo.id,
        shippingMethod: shippingInfo.shippingMethod,
        instructions: shippingInfo.instructions,
        shippingCost: shippingInfo.shippingCost?.toString() ?? null,
        shippingDate: shippingInfo.shippingDate?.toISOString() ?? null,
        shippingNotes: shippingInfo.shippingNotes,
        shippingOther: shippingInfo.shippingOther,
        shipToSameAsBillTo: shippingInfo.shipToSameAsBillTo,
        estimatedDelivery: shippingInfo.estimatedDelivery?.toISOString() ?? null,
        numberOfPackages: shippingInfo.numberOfPackages,
        trackingNumber: shippingInfo.trackingNumber,
        attentionTo: shippingInfo.attentionTo,
        addressId: shippingInfo.addressId,
        createdAt: shippingInfo.createdAt.toISOString(),
        updatedAt: shippingInfo.updatedAt.toISOString(),
        createdById: shippingInfo.createdById,
        officeId: shippingInfo.officeId,
        Address: shippingInfo.Address ? normalizeAddress(shippingInfo.Address) : null,
        ShippingPickup: shippingInfo.ShippingPickup.length > 0 && shippingInfo.ShippingPickup[0]
            ? normalizeShippingPickup(shippingInfo.ShippingPickup[0])
            : null,
    };
}

export function normalizeAddress(address: Address): SerializedAddress {
    return {
        id: address.id,
        officeId: address.officeId,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        telephoneNumber: address.telephoneNumber,
        addressType: address.addressType,
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
    };
}

export function normalizeShippingPickup(pickup: ShippingPickup): SerializedShippingPickup {
    return {
        id: pickup.id,
        pickupDate: pickup.pickupDate.toISOString(),
        pickupTime: pickup.pickupTime,
        notes: pickup.notes,
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        createdAt: pickup.createdAt.toISOString(),
        updatedAt: pickup.updatedAt.toISOString(),
        createdById: pickup.createdById,
        shippingInfoId: pickup.shippingInfoId,
    };
}

export function normalizeProcessingOptions(options: ProcessingOptions): SerializedProcessingOptions {
    return {
        id: options.id,
        cutting: options.cutting,
        padding: options.padding,
        drilling: options.drilling,
        folding: options.folding,
        other: options.other,
        numberingStart: options.numberingStart,
        numberingEnd: options.numberingEnd,
        numberingColor: options.numberingColor,
        createdAt: options.createdAt.toISOString(),
        updatedAt: options.updatedAt.toISOString(),
        orderItemId: options.orderItemId,
        workOrderItemId: options.workOrderItemId,
        createdById: options.createdById,
        description: options.description,
        name: options.name,
        stitching: options.stitching,
        binderyTime: options.binderyTime,
        binding: options.binding,
    };
}

export function normalizeTypesetting(typesetting: Typesetting & {
    TypesettingOptions: TypesettingOption[];
    TypesettingProofs: TypesettingProof[];
}): SerializedTypesetting {
    return {
        id: typesetting.id,
        approved: typesetting.approved,
        cost: typesetting.cost?.toString() ?? null,
        createdAt: typesetting.createdAt.toISOString(),
        createdById: typesetting.createdById,
        dateIn: typesetting.dateIn.toISOString(),
        followUpNotes: typesetting.followUpNotes,
        orderItemId: typesetting.orderItemId,
        plateRan: typesetting.plateRan,
        prepTime: typesetting.prepTime,
        status: typesetting.status,
        timeIn: typesetting.timeIn,
        updatedAt: typesetting.updatedAt.toISOString(),
        workOrderItemId: typesetting.workOrderItemId,
        TypesettingOptions: typesetting.TypesettingOptions.map(normalizeTypesettingOption),
        TypesettingProofs: typesetting.TypesettingProofs.map(normalizeTypesettingProof),
    };
}

export function normalizeTypesettingOption(option: TypesettingOption): SerializedTypesettingOption {
    return {
        id: option.id,
        typesettingId: option.typesettingId,
        option: option.option,
        selected: option.selected,
        createdAt: option.createdAt.toISOString(),
        createdById: option.createdById,
        updatedAt: option.updatedAt.toISOString(),
    };
}

export function normalizeTypesettingProof(proof: TypesettingProof): SerializedTypesettingProof {
    return {
        id: proof.id,
        typesettingId: proof.typesettingId,
        proofNumber: proof.proofNumber,
        dateSubmitted: proof.dateSubmitted?.toISOString() ?? null,
        notes: proof.notes,
        approved: proof.approved,
        createdAt: proof.createdAt.toISOString(),
        createdById: proof.createdById,
        updatedAt: proof.updatedAt.toISOString(),
        proofCount: proof.proofCount,
        proofMethod: proof.proofMethod,
    };
}

export function normalizeWorkOrderItemArtwork(artwork: WorkOrderItemArtwork): SerializedWorkOrderItemArtwork {
    return {
        id: artwork.id,
        workOrderItemId: artwork.workOrderItemId,
        fileUrl: artwork.fileUrl,
        description: artwork.description,
        createdAt: artwork.createdAt.toISOString(),
        updatedAt: artwork.updatedAt.toISOString(),
    };
}

export function normalizeWorkOrderItemStock(stock: WorkOrderItemStock): SerializedWorkOrderItemStock {
    return {
        id: stock.id,
        stockQty: stock.stockQty,
        costPerM: stock.costPerM.toString(),
        totalCost: stock.totalCost?.toString() ?? null,
        from: stock.from,
        expectedDate: stock.expectedDate?.toISOString() ?? null,
        orderedDate: stock.orderedDate?.toISOString() ?? null,
        received: stock.received,
        receivedDate: stock.receivedDate?.toISOString() ?? null,
        notes: stock.notes,
        stockStatus: stock.stockStatus,
        createdAt: stock.createdAt.toISOString(),
        updatedAt: stock.updatedAt.toISOString(),
        workOrderItemId: stock.workOrderItemId,
        createdById: stock.createdById,
        supplier: stock.supplier,
    };
}

export function normalizeWorkOrderNote(note: WorkOrderNote): SerializedWorkOrderNote {
    return {
        id: note.id,
        workOrderId: note.workOrderId,
        note: note.note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        createdById: note.createdById
    };
}

export function normalizeWorkOrderVersion(version: WorkOrderVersion): SerializedWorkOrderVersion {
    return {
        id: version.id,
        workOrderId: version.workOrderId,
        version: version.version,
        createdBy: version.createdBy,
        createdAt: version.createdAt.toISOString()
    };
}

export function normalizeInvoice(invoice: Invoice & {
    InvoiceItems: InvoiceItem[];
    InvoicePayments: InvoicePayment[];
}): SerializedInvoice {
    return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        dateIssued: invoice.dateIssued.toISOString(),
        dateDue: invoice.dateDue.toISOString(),
        subtotal: invoice.subtotal.toString(),
        taxRate: invoice.taxRate.toString(),
        taxAmount: invoice.taxAmount.toString(),
        total: invoice.total.toString(),
        status: invoice.status,
        notes: invoice.notes,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        orderId: invoice.orderId,
        createdById: invoice.createdById,
        InvoiceItems: invoice.InvoiceItems.map(normalizeInvoiceItem),
        InvoicePayments: invoice.InvoicePayments.map(normalizeInvoicePayment),
    };
}