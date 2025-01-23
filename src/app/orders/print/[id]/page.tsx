'use server';

import OrderPrintPreview from '~/app/_components/orders/OrderPrintPreview';
import { api } from '~/trpc/server';
import { type SerializedOrder } from '~/types/serializedTypes';

export default async function OrderPrintPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;


  try {
    const order = await api.orders.getByID(params.id);

    if (!order) {
      return <div>Order not found</div>;
    }

    return <OrderPrintPreview order={order} />;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return <div>Error loading order</div>;
  }
}