'use server';

import OrderItemPrintPreview from '~/app/_components/orders/orderItem/OrderItemPrintPreview';
import { api } from '~/trpc/server';
import { type SerializedOrderItem, type SerializedOrder, type SerializedShippingInfo, type SerializedTypesetting, type SerializedOrderItemStock, type SerializedProcessingOptions } from '~/types/serializedTypes';
import { normalizeTypesetting, normalizeOrderItemStock, normalizeProcessingOptions } from '~/utils/dataNormalization';
export default async function OrderPrintPage(
    props: {
        params: Promise<{ id: string, orderItemId: string }>;
    }
) {
    const params = await props.params;

    

    try {
        const orderItem = await api.orderItems.getByID(params.orderItemId);
        const typesettingData = await api.typesettings.getByOrderItemID(params.orderItemId);
        const orderItemStocks = await api.orderItemStocks.getByOrderItemId(params.orderItemId);
        const paperProducts = await api.paperProducts.getAll();
        const processingOptions = await api.processingOptions.getByOrderItemId(params.orderItemId);
        const order = await api.orders.getByID(params.id);
        if (!orderItem) {
            return <div>Order Item not found</div>;
        }

        const normalizedTypesetting = typesettingData ? typesettingData.map(normalizeTypesetting) : [];
        const normalizedProcessingOptions = processingOptions ? processingOptions.map(normalizeProcessingOptions) : [];

        const findPaperProduct = (id: string) => {
            if (!id) return null;
            const paperProduct = paperProducts?.find(product => product.id === id);
            return paperProduct ? `${paperProduct.brand} ${paperProduct.finish} ${paperProduct.paperType} ${paperProduct.size} ${paperProduct.weightLb}lbs.` : null;
        };

        const normalizedOrderItemStocks = orderItemStocks ?? [];

        let orderPaperProducts: any[] = [];
        if (orderItemStocks) {
            // Build a list of paper products
            orderPaperProducts = orderItemStocks.map(stock => findPaperProduct(stock.paperProductId || ''));
        }
        return <OrderItemPrintPreview
            orderItem={orderItem as SerializedOrderItem}
            order={order as SerializedOrder}
            shippingInfo={order?.ShippingInfo as SerializedShippingInfo}
            normalizedTypesetting={normalizedTypesetting as SerializedTypesetting[]}
            normalizedOrderItemStocks={normalizedOrderItemStocks as SerializedOrderItemStock[]}
            orderPaperProducts={orderPaperProducts as any[]}
            processingOptions={normalizedProcessingOptions as SerializedProcessingOptions[]} />;
    } catch (error) {
        console.error('Failed to fetch order item:', error);
        return <div>Error loading order item</div>;
    }
}