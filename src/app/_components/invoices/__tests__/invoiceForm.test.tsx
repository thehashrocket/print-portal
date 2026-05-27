// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCreateInvoice = vi.fn().mockResolvedValue({ id: 'inv-1' });

const mockOrders = [
    {
        id: 'order-1',
        orderNumber: 101,
        status: 'Pending',
        createdAt: new Date('2026-01-01').toISOString(),
        updatedAt: new Date('2026-01-01').toISOString(),
        dateInvoiced: null,
        deposit: '0',
        inHandsDate: null,
        Office: { Company: { name: 'Acme Corp' } },
    },
];

const mockOrderItems = [
    { id: 'item-1', description: 'Business Cards', quantity: 100, amount: '0.25' },
    { id: 'item-2', description: 'Flyers', quantity: 50, amount: '0.50' },
];

vi.mock('~/trpc/react', () => ({
    api: {
        invoices: {
            create: {
                useMutation: () => ({
                    mutateAsync: mockCreateInvoice,
                    isPending: false,
                }),
            },
        },
        orders: {
            getAll: {
                useQuery: () => ({ data: mockOrders }),
            },
        },
        orderItems: {
            getByOrderId: {
                useQuery: (_id: string, opts: { enabled: boolean }) => ({
                    data: opts.enabled ? mockOrderItems : [],
                }),
            },
        },
    },
}));

vi.mock('~/app/_components/shared/ui/SelectField/SelectField', () => ({
    SelectField: ({
        options,
        value,
        onValueChange,
        placeholder,
    }: {
        options: { value: string; label: string }[];
        value: string;
        onValueChange: (v: string) => void;
        placeholder?: string;
    }) => (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            aria-label={placeholder ?? 'select'}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    ),
}));

import InvoiceForm from '../invoiceForm';

describe('InvoiceForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with order select, date inputs, and submit button', () => {
        render(<InvoiceForm />);
        expect(screen.getByLabelText(/select an order/i)).toBeInTheDocument();
        // Labels are present even if Controller inputs lack id attributes
        expect(screen.getByText('Date Issued')).toBeInTheDocument();
        expect(screen.getByText('Due Date')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();
    });

    it('shows available orders in the order dropdown', () => {
        render(<InvoiceForm />);
        expect(screen.getByText(/order #101 - acme corp/i)).toBeInTheDocument();
    });

    it('shows a validation error when submitting without selecting an order', async () => {
        const { container } = render(<InvoiceForm />);
        const form = container.querySelector('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            // zodResolver emits Zod's default message for undefined z.string()
            expect(
                screen.getByText(/invalid input: expected string, received undefined/i)
            ).toBeInTheDocument();
        });
    });

    it('Add Item button appends a new item row with description, qty, and price fields', async () => {
        const user = userEvent.setup();
        render(<InvoiceForm />);

        expect(screen.queryByPlaceholderText(/description/i)).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /add item/i }));

        expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/qty/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();
    });

    it('Remove button deletes an item row', async () => {
        const user = userEvent.setup();
        render(<InvoiceForm />);

        await user.click(screen.getByRole('button', { name: /add item/i }));
        expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /remove/i }));

        expect(screen.queryByPlaceholderText(/description/i)).not.toBeInTheDocument();
    });

    it('selecting an order pre-populates item rows from order items', async () => {
        render(<InvoiceForm />);

        expect(screen.queryAllByPlaceholderText(/description/i)).toHaveLength(0);

        fireEvent.change(screen.getByLabelText(/select an order/i), {
            target: { value: 'order-1' },
        });

        await waitFor(() => {
            const descInputs = screen.getAllByPlaceholderText(/description/i);
            expect(descInputs).toHaveLength(mockOrderItems.length);
        });
    });

    it('shows a due date error when a past date is entered', async () => {
        const { container } = render(<InvoiceForm />);

        // Select an order so orderId passes validation
        fireEvent.change(screen.getByLabelText(/select an order/i), {
            target: { value: 'order-1' },
        });

        // Controller inputs lack an id — query by name attribute
        const dueDateInput = container.querySelector<HTMLInputElement>('[name="dateDue"]')!;
        fireEvent.change(dueDateInput, { target: { value: '2020-01-01' } });

        const form = container.querySelector('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(
                screen.getByText(/due date must be today or in the future/i)
            ).toBeInTheDocument();
        });
    });

    it('calls create mutation with orderId and pre-populated items on valid submit', async () => {
        const { container } = render(<InvoiceForm />);

        // Select an order — triggers item pre-population via orderItems useEffect
        fireEvent.change(screen.getByLabelText(/select an order/i), {
            target: { value: 'order-1' },
        });

        await waitFor(() => {
            expect(screen.getAllByPlaceholderText(/description/i)).toHaveLength(
                mockOrderItems.length
            );
        });

        const form = container.querySelector('form')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockCreateInvoice).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderId: 'order-1',
                    items: expect.arrayContaining([
                        expect.objectContaining({ description: 'Business Cards' }),
                        expect.objectContaining({ description: 'Flyers' }),
                    ]),
                })
            );
        });
    });
});
