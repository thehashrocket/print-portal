'use client';

import React from 'react';
import { SerializedOrder } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { Button } from '../ui/button';
import { ShippingMethod } from '@prisma/client';
import { ArrowLeft, Printer } from 'lucide-react';
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
            <div className="flex flex-row mb-8 print:hidden">
                <Button variant="default" onClick={() => {
                    // Back button
                    router.back();
                }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button variant="default" className="ml-4 print:hidden" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
            </div>
            <header className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-2">
                    <img src="/images/thomson-pdf-logo.svg" alt="Thomson Logo" className="w-64" />
                </div>
                <div className="flex flex-col gap-2 w-[40%]">
                    <h1 className="text-3xl font-bold text-green-700">Order Details</h1>
                </div>
            </header>
            <section className="flex items-start justify-between mb-8 avoid-break">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold mb-1">CONTACT INFORMATION</h2>
                    <div className="flex">
                        <p className="w-32 font-bold">Company:</p>
                        {order.Office.isWalkInOffice ? (
                            <p>{order.WalkInCustomer?.name}</p>
                        ) : (
                            <p>{order.Office.Company.name}</p>
                        )}
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">Contact:</p>
                        {order.Office.isWalkInOffice ? (
                            <p>{order.WalkInCustomer?.name}</p>
                        ) : (
                            <p>{order.contactPerson?.name}</p>
                        )}
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">Email:</p>
                        {order.Office.isWalkInOffice ? (
                            <p>{order.WalkInCustomer?.email}</p>
                        ) : (
                            <p>{order.contactPerson?.email}</p>
                        )}
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">Phone:</p>
                        {order.Office.isWalkInOffice ? (
                            <p>{order.WalkInCustomer?.phone}</p>
                        ) : (
                            <p>{order.ShippingInfo?.Address?.telephoneNumber || 'N/A'}</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-[40%]">
                    <h2 className="text-xl font-bold mb-1">ORDER INFORMATION</h2>
                    <div className="flex">
                        <p className="w-32 font-bold">Order Number:</p>
                        <p>{order.orderNumber}</p>
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">PO Number:</p>
                        <p>{order.purchaseOrderNumber || 'N/A'}</p>
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">Date:</p>
                        <p>{formatDate(order.updatedAt || '')}</p>
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">In Hands Date:</p>
                        <p>{formatDate(order.inHandsDate || '')}</p>
                    </div>
                    <div className="flex">
                        <p className="w-32 font-bold">Ship To:</p>
                        <p>{order.Office.Company.name}</p>
                    </div>
                </div>
            </section>
            <div className="flex flex-row justify-between avoid-break">
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">SHIPPING INFO</h2>
                    {order?.ShippingInfo?.shippingMethod === ShippingMethod.Pickup ? (
                        <>
                            <div className="flex">
                                <p className="w-32 font-bold">Shipping Method</p>
                                <p>{order?.ShippingInfo?.shippingMethod || 'N/A'}</p>
                            </div>
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
                <section className="mb-8 w-[40%]">
                    <h2 className="text-xl font-bold mb-4">NOTES</h2>
                    <p>{order.notes || 'N/A'}</p>
                </section>
            </div>
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
                <Printer className="w-4 h-4" />
                Print
            </Button>
        </div>
    );
};

export default OrderPrintPreview;