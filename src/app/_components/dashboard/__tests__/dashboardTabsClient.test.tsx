// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('lucide-react', () => ({
    Info: () => null,
    X: () => null,
    Building2: () => null,
    CalendarDays: () => null,
    Eye: () => null,
}));

vi.mock('next/link', () => ({
    default: ({ href, children }: { href: string; children: React.ReactNode }) =>
        React.createElement('a', { href }, children),
}));

vi.mock('~/trpc/react', () => ({
    api: {
        orderItems: {
            getOutsourced: { useQuery: () => ({ data: [], isLoading: false }) },
            updateStatus: { useMutation: () => ({ mutateAsync: vi.fn() }) },
        },
        orders: {
            updateStatus: { useMutation: () => ({ mutateAsync: vi.fn() }) },
        },
    },
}));

vi.mock('~/app/_components/primitives/RegMark', () => ({ RegMark: () => null }));
vi.mock('~/app/_components/primitives/CmykRow', () => ({ CmykRow: () => null }));
vi.mock('~/app/_components/primitives/Pill', () => ({ Pill: () => null }));
vi.mock('~/app/_components/shared/ui/CustomComboBox', () => ({
    CustomComboBox: () => null,
}));

// Capture props passed to child components on each render
let lastItemsProps: { initialOrderItems: unknown[] } | null = null;
let lastOnStatusChange: ((id: string, status: string) => void) | null = null;

vi.mock('~/app/_components/dashboard/orders/draggableOrdersDash', () => ({
    default: ({ initialOrders, onOrderStatusChange }: {
        initialOrders: unknown[];
        onOrderStatusChange?: (id: string, status: string) => void;
    }) => {
        lastOnStatusChange = onOrderStatusChange ?? null;
        return React.createElement('div', { 'data-testid': 'orders-dash' }, `orders: ${initialOrders.length}`);
    },
}));

vi.mock('~/app/_components/dashboard/orderItems/draggableOrderItemsDash', () => ({
    default: ({ initialOrderItems }: { initialOrderItems: unknown[] }) => {
        lastItemsProps = { initialOrderItems };
        return React.createElement('div', { 'data-testid': 'items-dash' }, `items: ${initialOrderItems.length}`);
    },
}));

vi.mock('~/app/_components/dashboard/orderItems/OutsourcedOrderItemsDash', () => ({
    default: () => React.createElement('div', { 'data-testid': 'outsourced-dash' }),
}));

import DashboardTabsClient from '../dashboardTabsClient';
import type { OrderDashboard } from '~/types/orderDashboard';
import type { OrderItemDashboard } from '~/types/orderItemDashboard';

function makeOrder(overrides: Partial<OrderDashboard> = {}): OrderDashboard {
    return {
        id: 'order-1',
        orderNumber: 1001,
        status: 'Pending' as OrderDashboard['status'],
        orderItemStatus: 'Prepress' as OrderDashboard['orderItemStatus'],
        companyName: 'ACME',
        inHandsDate: null,
        deposit: 0,
        purchaseOrderNumber: '',
        orderItems: [],
        ...overrides,
    };
}

function makeItem(overrides: Partial<OrderItemDashboard> = {}): OrderItemDashboard {
    return {
        id: 'item-1',
        orderId: 'order-1',
        orderItemNumber: 1,
        position: 1,
        totalItems: 1,
        expectedDate: new Date('2026-12-31'),
        status: 'Prepress' as OrderItemDashboard['status'],
        description: 'Test item',
        companyName: 'ACME',
        purchaseOrderNumber: 'PO-001',
        orderNumber: '1001',
        orderStatus: 'Pending' as OrderItemDashboard['orderStatus'],
        createdAt: new Date(),
        updatedAt: new Date(),
        amount: null,
        cost: null,
        shippingAmount: null,
        ...overrides,
    };
}

async function switchToOrderItemsTab() {
    const user = userEvent.setup();
    const tabBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Order Items'));
    if (tabBtn) await user.click(tabBtn);
}

describe('DashboardTabsClient — order status cascade', () => {
    beforeEach(() => {
        lastItemsProps = null;
        lastOnStatusChange = null;
    });

    it('passes onOrderStatusChange callback to DraggableOrdersDash', () => {
        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[makeItem()]} />);
        expect(lastOnStatusChange).toBeTypeOf('function');
    });

    it('cascades Completed status to matching order items', async () => {
        const item1 = makeItem({ id: 'i1', orderId: 'order-1', status: 'Press' as OrderItemDashboard['status'] });
        const item2 = makeItem({ id: 'i2', orderId: 'order-2', status: 'Prepress' as OrderItemDashboard['status'] });

        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[item1, item2]} />);

        await switchToOrderItemsTab();

        expect(lastItemsProps?.initialOrderItems).toHaveLength(2);
        const before = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(before[0]?.status).toBe('Press');

        await act(async () => { lastOnStatusChange?.('order-1', 'Completed'); });

        const after = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(after.find(i => (i as OrderItemDashboard).id === 'i1')?.status).toBe('Completed');
        expect(after.find(i => (i as OrderItemDashboard).id === 'i2')?.status).toBe('Prepress');
    });

    it('cascades Cancelled status to matching order items', async () => {
        const item = makeItem({ orderId: 'order-1', status: 'Bindery' as OrderItemDashboard['status'] });
        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[item]} />);
        await switchToOrderItemsTab();
        await act(async () => { lastOnStatusChange?.('order-1', 'Cancelled'); });
        const items = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(items[0]?.status).toBe('Cancelled');
    });

    it('cascades Invoiced status to matching order items', async () => {
        const item = makeItem({ orderId: 'order-1', status: 'Shipping' as OrderItemDashboard['status'] });
        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[item]} />);
        await switchToOrderItemsTab();
        await act(async () => { lastOnStatusChange?.('order-1', 'Invoiced'); });
        const items = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(items[0]?.status).toBe('Invoiced');
    });

    it('does NOT cascade non-cascade statuses (Pending, PaymentReceived, Shipping)', async () => {
        const item = makeItem({ orderId: 'order-1', status: 'Press' as OrderItemDashboard['status'] });
        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[item]} />);
        await switchToOrderItemsTab();

        await act(async () => { lastOnStatusChange?.('order-1', 'Pending'); });
        await act(async () => { lastOnStatusChange?.('order-1', 'PaymentReceived'); });
        await act(async () => { lastOnStatusChange?.('order-1', 'Shipping'); });

        const items = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(items[0]?.status).toBe('Press'); // unchanged
    });

    it('leaves items for unrelated orders untouched', async () => {
        const item1 = makeItem({ id: 'i1', orderId: 'order-A', status: 'Prepress' as OrderItemDashboard['status'] });
        const item2 = makeItem({ id: 'i2', orderId: 'order-B', status: 'Press' as OrderItemDashboard['status'] });
        render(<DashboardTabsClient orders={[makeOrder()]} orderItems={[item1, item2]} />);
        await switchToOrderItemsTab();
        await act(async () => { lastOnStatusChange?.('order-A', 'Completed'); });
        const items = lastItemsProps?.initialOrderItems as OrderItemDashboard[];
        expect(items.find(i => (i as OrderItemDashboard).id === 'i1')?.status).toBe('Completed');
        expect(items.find(i => (i as OrderItemDashboard).id === 'i2')?.status).toBe('Press');
    });
});
