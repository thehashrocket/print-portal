'use client';

import React from 'react';
import { SerializedOrder } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { Button } from '../ui/button';
import { ShippingMethod } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface OrderPrintPreviewProps {
    order: SerializedOrder;
}

const OrderPrintPreview: React.FC<OrderPrintPreviewProps> = ({ order }) => {
    const router = useRouter();
    return (
        <div className="p-8 bg-white">
            <style jsx global>{`
                @media print {
                    .page-break-before {
                        break-before: page;
                        page-break-before: always;
                    }
                    .page-break-after {
                        break-after: page;
                        page-break-after: always;
                    }
                    .avoid-break {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
            <div className="flex items-center justify-between mb-8 print:hidden">
                <Button variant="default" onClick={() => {
                    // Back button
                    router.back();
                }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
            </div>
            <header className="flex items-center justify-between mb-8">
                <img src="/images/thomson-pdf-logo.svg" alt="Thomson Logo" className="w-32" />
                <h1 className="text-3xl font-bold text-green-700">Order Details</h1>
            </header>
            <section className="grid grid-cols-2 gap-8 mb-8 avoid-break">
                <div>
                    <p><strong>Order Number:</strong> {order.orderNumber}</p>
                    <p><strong>PO Number:</strong> {order.WorkOrder?.purchaseOrderNumber || 'N/A'}</p>
                    <p><strong>Date:</strong> {formatDate(order.updatedAt || '')}</p>
                    <p><strong>In Hands Date:</strong> {formatDate(order.inHandsDate || '')}</p>
                    <p><strong>Ship To:</strong> {order.Office.Company.name}</p>
                </div>
                <div>
                    <p><strong>Shipping Method:</strong> {order.ShippingInfo?.shippingMethod || 'N/A'}</p>
                    <p><strong>Tracking Number:</strong> {order.ShippingInfo?.trackingNumber?.join(', ') || 'N/A'}</p>
                    <p><strong>Company:</strong> {order.Office.Company.name}</p>
                    <p><strong>Contact:</strong> {order.contactPerson?.name}</p>
                    <p><strong>Email:</strong> {order.contactPerson?.email}</p>
                </div>
            </section>
            <section className="mb-8 avoid-break">
                <h2 className="text-xl font-bold mb-4">SHIPPING INFO</h2>
                {order?.ShippingInfo?.shippingMethod === ShippingMethod.Pickup ? (
                    <>
                        <div className="flex">
                            <p className="w-32 font-bold">Pickup Date</p>
                            <p>{order?.ShippingInfo?.ShippingPickup?.pickupDate ? formatDate(order?.ShippingInfo?.ShippingPickup?.pickupDate) : 'N/A'}</p>
                        </div>
                        <div className="flex">
                            <p className="w-32 font-bold">Pickup Time</p>
                            <p>{order?.ShippingInfo?.ShippingPickup?.pickupTime || 'N/A'}</p>
                        </div>
                        <div className="flex">
                            <p className="w-32 font-bold">Pickup Notes</p>
                            <p>{order?.ShippingInfo?.ShippingPickup?.notes || 'N/A'}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex">
                            <p className="w-32 font-bold">Shipping Method</p>
                            <p>{order?.ShippingInfo?.shippingMethod || 'N/A'}</p>
                        </div>
                        {order.ShippingInfo?.Address && (
                            <div className="mt-2">
                                <p className="font-bold mb-2">SHIPPING ADDRESS</p>
                                <p>{order.ShippingInfo.Address.name}</p>
                                <p>{order.ShippingInfo.Address.line1}</p>
                                {order.ShippingInfo.Address.line2 && <p>{order.ShippingInfo.Address.line2}</p>}
                                {order.ShippingInfo.Address.line3 && <p>{order.ShippingInfo.Address.line3}</p>}
                                {order.ShippingInfo.Address.line4 && <p>{order.ShippingInfo.Address.line4}</p>}
                                <p>{order.ShippingInfo.Address.city}, {order.ShippingInfo.Address.state} {order.ShippingInfo.Address.zipCode}</p>
                            </div>
                        )}
                        <div className="flex mt-2">
                            <p className="w-32 font-bold">Shipping Date</p>
                            <p>{order.ShippingInfo?.shippingDate ? formatDate(order.ShippingInfo.shippingDate) : 'N/A'}</p>
                        </div>
                        <div className="flex">
                            <p className="w-32 font-bold">Tracking Number</p>
                            <p>{order.ShippingInfo?.trackingNumber?.join(', ') || 'N/A'}</p>
                        </div>
                    </>
                )}
                <div className="flex mt-2">
                    <p className="w-32 font-bold">Shipping Inst.</p>
                    <p>{order.ShippingInfo?.instructions || 'N/A'}</p>
                </div>
            </section>
            <section className="mb-8 avoid-break">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Item</th>
                            <th className="py-2 px-4 border-b">Quantity</th>
                            <th className="py-2 px-4 border-b">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.OrderItems.map(item => (
                            <tr key={item.id}>
                                <td className="py-2 px-4 border-b">{item.description}</td>
                                <td className="py-2 px-4 border-b">{item.quantity}</td>
                                <td className="py-2 px-4 border-b">{formatCurrency(item.amount || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="text-right avoid-break">
                <p><strong>Item Total:</strong> {formatCurrency(order.calculatedSubTotal || 0)}</p>
                <p><strong>Shipping:</strong> {formatCurrency(order.totalShippingAmount || 0)}</p>
                <p><strong>Tax:</strong> {formatCurrency(order.calculatedSalesTax || 0)}</p>
                <p className="text-lg font-bold"><strong>Total:</strong> {formatCurrency(order.totalAmount || 0)}</p>
            </section>
            <Button variant="default" className="mt-4 print:hidden" onClick={() => window.print()}>
                Print
            </Button>
        </div>
    );
};

export default OrderPrintPreview;