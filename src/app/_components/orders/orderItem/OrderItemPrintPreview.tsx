"use client";

import React from 'react';
import { SerializedOrderItem, SerializedOrder, SerializedShippingInfo, SerializedTypesetting, SerializedOrderItemStock, SerializedProcessingOptions } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { Button } from '~/app/_components/ui/button';
import { OrderItemStatus, ShippingMethod } from '@prisma/client';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItemPrintPreviewProps {
  orderItem: SerializedOrderItem;
  order: SerializedOrder;
  shippingInfo: SerializedShippingInfo;
  normalizedTypesetting: SerializedTypesetting[];
  normalizedOrderItemStocks: SerializedOrderItemStock[];
  orderPaperProducts: any;
  processingOptions: SerializedProcessingOptions[];
}

const OrderItemPrintPreview: React.FC<OrderItemPrintPreviewProps> = ({
  orderItem,
  order,
  shippingInfo,
  normalizedTypesetting,
  normalizedOrderItemStocks,
  orderPaperProducts,
  processingOptions
}) => {
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
      {/* Row 1: Header with Logo and Status */}
      <div className="flex justify-between items-start mb-4">
        <img src="/images/thomson-pdf-logo.svg" alt="Thomson Logo" className="w-64" />
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1">
            <p className="w-32 text-xl font-bold">ORDER</p>
            <p className="w-32 text-xl">#{order.orderNumber}</p>
          </div>
          <div className="flex flex-row gap-1">
            <p className="w-32 text-xl font-bold">Status</p>
            <p className="text-xl">{orderItem.status}</p>
          </div>
          {orderItem.status === OrderItemStatus.Outsourced && (
            <div className="flex flex-row gap-1">
              <p className="w-32 text-xl font-bold">Outsourced</p>
              <p className="text-xl">{orderItem.OutsourcedOrderItemInfo?.companyName}</p>
            </div>
          )}
        </div>
      </div>
      {/* Row 2: Contact Information and Item Details */}
      <div className="flex items-start justify-between mb-8 avoid-break">

        {/* Left Column: Contact Information */}
        <div className="flex flex-col">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-1">CONTACT INFORMATION</h2>
            <div className="flex flex-col gap-1">
              <p className="w-32 text-xl font-bold">Company</p>
              <p className="text-xl font-bold">{order.Office.Company.name}</p>
            </div>
            <div className="flex">
              {order.WalkInCustomer != null ? (
                <p>{order.WalkInCustomer.name}</p>
              ) : (
                <p>{order.contactPerson?.name || 'N/A'}</p>
              )}
            </div>
            <div className="flex">
              {order.WalkInCustomer != null ? (
                <p>{order.WalkInCustomer.email}</p>
              ) : (
                <p>{order.contactPerson?.email || 'N/A'}</p>
              )}
            </div>
            <div className="flex">
              {order.WalkInCustomer != null ? (
                <p>{order.WalkInCustomer.phone}</p>
              ) : (
                <p className="text-xl">{shippingInfo.Address?.telephoneNumber || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Item Details */}
        <div className="flex flex-col w-1/2">
          <h2 className="text-3xl font-bold text-green-700">Item Details</h2>
          <div className="flex">
            <p className="w-32 font-bold">P.O. Number</p>
            <p>{order.purchaseOrderNumber || 'N/A'}</p>
          </div>

          <div className="flex">
            <p className="w-32 font-bold">Date Started</p>
            <p>{formatDate(orderItem.createdAt)}</p>
          </div>

          <div className="flex">
            <p className="w-32 font-bold">In Hands Date</p>
            <p>{formatDate(order.inHandsDate || '')}</p>
          </div>

          <div className="flex items-center">
            <p className="w-32 font-bold">Item</p>
            <p className="text-xl font-bold">#{orderItem.orderItemNumber}</p>
          </div>

          <div className="flex items-center">
            <p className="w-32 font-bold">PRODUCT TYPE</p>
            <p className="text-xl font-bold">{orderItem.ProductType?.name || 'N/A'}</p>
          </div>

          <div className="flex">
            <p className="w-32 font-bold">Quantity</p>
            <p>{orderItem.quantity}</p>
          </div>
          <div className="flex">
            <p className="w-32 font-bold">Size</p>
            <p>{orderItem.size || 'N/A'}</p>
          </div>
          <div className="flex">
            <p className="w-32 font-bold">Color</p>
            <p>{orderItem.ink || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Row 3: Typesetting Details and Paper Stock */}
      <div className='flex items-start justify-between avoid-break mt-2'>
        {/* Typesetting Section */}
        <div className='flex flex-col'>
          {normalizedTypesetting?.[0] && (
            <div className="">
              <h2 className="text-xl font-bold">TYPESETTING DETAILS</h2>
              <div className="grid grid-cols-2">
                {Object.entries(normalizedTypesetting[0] as unknown as Record<string, unknown>)
                  .filter(([key]) => !['createdAt', 'updatedAt', 'createdById', 'orderItemId', 'id', 'workOrderItemId', 'TypesettingOptions', 'TypesettingProofs'].includes(key))
                  .map(([key, value], index) => {
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex">
                        <p className="w-32 font-bold text-sm">{formattedKey}</p>
                        <p className='text-sm'>{formattedKey === 'Date In' ? formatDate(value as Date) : String(value || 'N/A')}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        {/* Paper Stock, Special Instructions, and Project Description Section */}
        <div className='flex flex-col w-1/2'>
          {orderPaperProducts && orderPaperProducts.length > 0 && (
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Paper Stock</h2>
              {orderPaperProducts.map((product: string, index: number) => (
                <p className='text-sm' key={index}>{product}</p>
              ))}
            </div>
          )}
          {/* Special Instructions Section */}
          {orderItem.specialInstructions && (
            <div className="avoid-break">
              <h2 className="text-xl font-bold">Special Instructions</h2>
              <p className="whitespace-pre-wrap text-sm">{orderItem.specialInstructions}</p>
            </div>
          )}
          {/* Project Description Section */}
          {orderItem.description && (
            <div className="avoid-break">
              <h2 className="text-xl font-bold">Project Description</h2>
              <p className="whitespace-pre-wrap text-sm">{orderItem.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Shipping Info and Bindery Options */}
      <div className='flex items-start justify-between avoid-break mt-2'>
        <div className='flex flex-col'>
          {/* Shipping Info Section */}
          <h2 className="text-xl font-bold">SHIPPING INFO</h2>
          <div className="">
            {shippingInfo.shippingMethod === ShippingMethod.Pickup && shippingInfo.ShippingPickup ? (
              <>
                <div className="flex">
                  <p className="w-32 font-bold">Pickup Date</p>
                  <p>{shippingInfo.ShippingPickup.pickupDate ? formatDate(shippingInfo.ShippingPickup.pickupDate) : 'N/A'}</p>
                </div>
                <div className="flex">
                  <p className="w-32 font-bold">Pickup Time</p>
                  <p>{shippingInfo.ShippingPickup.pickupTime || 'N/A'}</p>
                </div>
                <div className="flex">
                  <p className="w-32 font-bold">Pickup Notes</p>
                  <p>{shippingInfo.ShippingPickup.notes || 'N/A'}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex">
                  <p className="w-32 font-bold">Shipping Method</p>
                  <p>{shippingInfo.shippingMethod || 'N/A'}</p>
                </div>
                {shippingInfo.Address && (
                  <div className="mt-2">
                    <p className="font-bold">SHIPPING ADDRESS</p>
                    <p className='text-sm'>{shippingInfo.Address.line1}</p>
                    {shippingInfo.Address.line2 && <p className='text-sm'>{shippingInfo.Address.line2}</p>}
                    {shippingInfo.Address.line3 && <p className='text-sm'>{shippingInfo.Address.line3}</p>}
                    {shippingInfo.Address.line4 && <p className='text-sm'>{shippingInfo.Address.line4}</p>}
                    <p className='text-sm'>{shippingInfo.Address.city}, {shippingInfo.Address.state} {shippingInfo.Address.zipCode}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <p className="w-32 font-bold">Shipping Date</p>
                  <p className='text-sm'>{shippingInfo.shippingDate ? formatDate(shippingInfo.shippingDate) : 'N/A'}</p>
                </div>
                <div className="flex items-center">
                  <p className="w-32 font-bold">Tracking Number</p>
                  <p className='text-sm'>{shippingInfo.trackingNumber?.join(', ') || 'N/A'}</p>
                </div>
              </>
            )}
            <div className="flex items-center">
              <p className="w-32 font-bold">Shipping Inst.</p>
              <p className='text-sm'>{shippingInfo.instructions || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col w-1/2'>
          {/* Bindery Options Section */}
          {processingOptions?.length > 0 && (
            <div className="avoid-break">
              <h2 className="text-xl font-bold">BINDERY OPTIONS</h2>
              {processingOptions.map((options, index) => (
                <div key={index} className="">
                  {index > 0 && (
                    <h3 className="font-bold mb-2">Option Set {index + 1}</h3>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="">
                      {/* Basic Options */}
                      {options.cutting && (
                        <div className="flex">
                          <p className="w-32 font-bold">Cutting</p>
                          <p>{options.cutting}</p>
                        </div>
                      )}
                      {options.padding && (
                        <div className="flex">
                          <p className="w-32 font-bold">Padding</p>
                          <p>{options.padding}</p>
                        </div>
                      )}
                      {options.drilling && (
                        <div className="flex">
                          <p className="w-32 font-bold">Drilling</p>
                          <p>{options.drilling}</p>
                        </div>
                      )}
                      {options.folding && (
                        <div className="flex">
                          <p className="w-32 font-bold">Folding</p>
                          <p>{options.folding}</p>
                        </div>
                      )}
                      {/* Additional Options */}
                      {options.stitching && (
                        <div className="flex">
                          <p className="w-32 font-bold">Stitching</p>
                          <p>{options.stitching}</p>
                        </div>
                      )}
                      {options.binding && (
                        <div className="flex">
                          <p className="w-32 font-bold">Binding</p>
                          <p>{options.binding}</p>
                        </div>
                      )}
                    </div>
                    <div className="">
                      {/* Numbering Options */}
                      {(options.numberingStart !== null && options.numberingStart !== undefined && options.numberingStart !== 0) && (
                        <div className="flex">
                          <p className="w-32 font-bold">Numbering Start</p>
                          <p>{options.numberingStart}</p>
                        </div>
                      )}
                      {(options.numberingEnd !== null && options.numberingEnd !== undefined && options.numberingEnd !== 0) && (
                        <div className="flex">
                          <p className="w-32 font-bold">Numbering End</p>
                          <p>{options.numberingEnd}</p>
                        </div>
                      )}
                      {options.numberingColor && (
                        <div className="flex">
                          <p className="w-32 font-bold">Numbering Color</p>
                          <p>{options.numberingColor}</p>
                        </div>
                      )}
                      {(options.binderyTime !== null && options.binderyTime !== undefined && options.binderyTime !== 0) && (
                        <div className="flex">
                          <p className="w-32 font-bold">Bindery Time</p>
                          <p>{options.binderyTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Other Fields */}
                  {(options.other || options.description) && (
                    <div className="">
                      {options.other && (
                        <div className="flex">
                          <p className="w-32 font-bold">Other</p>
                          <p>{options.other}</p>
                        </div>
                      )}
                      {options.description && (
                        <div className="flex">
                          <p className="w-32 font-bold">Description</p>
                          <p>{options.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Proof Files Section */}
      {(() => {
        const proofs = normalizedTypesetting?.[0]?.TypesettingProofs;
        if (!proofs?.length) return null;
        return (
          <div className="avoid-break">
            <h2 className="text-xl font-bold">PROOF FILE NAME(S)</h2>
            <div className="space-y-1">
              {proofs.map((proof: any) =>
                proof.artwork?.map((art: any, index: number) => (
                  <p key={index}>{art.fileUrl}</p>
                ))
              )}
            </div>
          </div>
        );
      })()}



      {/* Print Button */}
      <Button variant="default" className="mt-8 print:hidden" onClick={() => window.print()}>
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );
};

export default OrderItemPrintPreview;