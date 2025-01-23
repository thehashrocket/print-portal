"use client";

import React from 'react';
import { SerializedOrderItem, SerializedOrder, SerializedShippingInfo, SerializedTypesetting, SerializedOrderItemStock, SerializedProcessingOptions } from '~/types/serializedTypes';
import { formatCurrency, formatDate } from '~/utils/formatters';
import { Button } from '~/app/_components/ui/button';
import { ShippingMethod } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Button variant="default" onClick={() => {
          // Back button
          router.back();
        }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      {/* Header with Logo and Status */}
      <div className="flex justify-between items-start mb-8">
        <img src="/images/thomson-pdf-logo.svg" alt="Thomson Logo" className="w-32" />
        <div className="text-right">
          <p className="text-red-600 text-xl font-bold">STATUS</p>
          <p className="text-xl">{orderItem.status}</p>
        </div>
      </div>

      {/* Item Details Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Column */}
        <div>
          <h2 className="text-xl font-bold mb-4">ITEM DETAILS</h2>
          <div className="space-y-2">
            <div className="flex">
              <p className="w-32 font-bold">ORDER</p>
              <p>#{order.orderNumber}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">COMPANY</p>
              <p>{order.Office?.Company.name}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4">CONTACT INFORMATION</h2>
          <div className="space-y-2">
            <div className="flex">
              <p className="w-32 font-bold">Name</p>
              <p>{order.contactPerson?.name || 'N/A'}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">Email</p>
              <p>{order.contactPerson?.email || 'N/A'}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">Phone</p>
              <p>{shippingInfo.Address?.telephoneNumber || 'N/A'}</p>
            </div>
          </div>

          {orderItem.ProductType && (
            <>
              <h2 className="text-xl font-bold mt-8 mb-4">Product Type</h2>
              <p>{orderItem.ProductType.name}</p>
            </>
          )}
        </div>

        {/* Right Column */}
        <div>
          <div className="space-y-2">
            <div className="flex">
              <p className="w-32 font-bold">DATE STARTED</p>
              <p>{formatDate(orderItem.createdAt)}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">IN HANDS DATE</p>
              <p>{formatDate(order.inHandsDate || '')}</p>
            </div>
          </div>

          <div className="space-y-2 mt-8">
            <div className="flex">
              <p className="w-32 font-bold">ITEM</p>
              <p>#{orderItem.orderItemNumber}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">P.O. NUMBER</p>
              <p>{order.WorkOrder?.purchaseOrderNumber || 'N/A'}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">QUANTITY</p>
              <p>{orderItem.quantity}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">SIZE</p>
              <p>{orderItem.size || 'N/A'}</p>
            </div>
            <div className="flex">
              <p className="w-32 font-bold">COLOR</p>
              <p>{orderItem.ink || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Paper Stock Section */}
      {orderPaperProducts && orderPaperProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Paper Stock</h2>
          <div className="space-y-1">
            {orderPaperProducts.map((product: string, index: number) => (
              <p key={index}>{product}</p>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Info Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">SHIPPING INFO</h2>
        <div className="space-y-2">
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
                  <p className="font-bold mb-2">SHIPPING ADDRESS</p>
                  <p>{shippingInfo.Address.line1}</p>
                  {shippingInfo.Address.line2 && <p>{shippingInfo.Address.line2}</p>}
                  {shippingInfo.Address.line3 && <p>{shippingInfo.Address.line3}</p>}
                  {shippingInfo.Address.line4 && <p>{shippingInfo.Address.line4}</p>}
                  <p>{shippingInfo.Address.city}, {shippingInfo.Address.state} {shippingInfo.Address.zipCode}</p>
                </div>
              )}
              <div className="flex mt-2">
                <p className="w-32 font-bold">Shipping Date</p>
                <p>{shippingInfo.shippingDate ? formatDate(shippingInfo.shippingDate) : 'N/A'}</p>
              </div>
              <div className="flex">
                <p className="w-32 font-bold">Tracking Number</p>
                <p>{shippingInfo.trackingNumber?.join(', ') || 'N/A'}</p>
              </div>
            </>
          )}
          <div className="flex mt-2">
            <p className="w-32 font-bold">Shipping Inst.</p>
            <p>{shippingInfo.instructions || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Project Description Section */}
      {orderItem.description && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Project Description</h2>
          <p className="whitespace-pre-wrap">{orderItem.description}</p>
        </div>
      )}

      {/* Special Instructions Section */}
      {orderItem.specialInstructions && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Special Instructions</h2>
          <p className="whitespace-pre-wrap">{orderItem.specialInstructions}</p>
        </div>
      )}

      {/* Typesetting Section */}
      {normalizedTypesetting?.[0] && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">TYPESETTING DETAILS</h2>
          <div className="grid grid-cols-2 gap-8">
            {Object.entries(normalizedTypesetting[0] as unknown as Record<string, unknown>)
              .filter(([key]) => !['createdAt', 'updatedAt', 'createdById', 'orderItemId', 'id', 'workOrderItemId', 'TypesettingOptions', 'TypesettingProofs'].includes(key))
              .map(([key, value], index) => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="flex">
                    <p className="w-32 font-bold">{formattedKey}</p>
                    <p>{String(value || 'N/A')}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Proof Files Section */}
      {(() => {
        const proofs = normalizedTypesetting?.[0]?.TypesettingProofs;
        if (!proofs?.length) return null;
        return (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">PROOF FILE NAME(S)</h2>
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

      {/* Bindery Options Section */}
      {processingOptions?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">BINDERY OPTIONS</h2>
          {processingOptions.map((options, index) => (
            <div key={index} className="mt-4">
              {index > 0 && (
                <h3 className="font-bold mb-2">Option Set {index + 1}</h3>
              )}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  {/* Numbering Options */}
                  {options.numberingStart && (
                    <div className="flex">
                      <p className="w-32 font-bold">Numbering Start</p>
                      <p>{options.numberingStart}</p>
                    </div>
                  )}
                  {options.numberingEnd && (
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
                  {options.binderyTime && (
                    <div className="flex">
                      <p className="w-32 font-bold">Bindery Time</p>
                      <p>{options.binderyTime}</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Other Fields */}
              {(options.other || options.description) && (
                <div className="mt-4 space-y-2">
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

      {/* Print Button */}
      <Button variant="default" className="mt-8 no-print" onClick={() => window.print()}>
        Print
      </Button>

      {/* Page Number */}
      <div className="mt-8 text-right text-sm">
        Page 1 of 1
      </div>
    </div>
  );
};

export default OrderItemPrintPreview;