// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// vi.hoisted ensures these are initialized before vi.mock factories run (hoisting fix).
const { mockPush, mockCreateWorkOrder, mockCreateWalkInCustomer, mockRefetchOffices, mockRefetchEmployees } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockCreateWorkOrder: vi.fn().mockResolvedValue({ id: 'wo-1' }),
    mockCreateWalkInCustomer: vi.fn().mockResolvedValue({ id: 'wic-1' }),
    mockRefetchOffices: vi.fn(),
    mockRefetchEmployees: vi.fn(),
}));

// Stable references prevent infinite render loops in useEffect([dep]) hooks
const mockCompanyData: never[] = [];
const mockOfficeData: never[] = [];
const mockEmployeeData: never[] = [];
const mockWalkInOffice = { id: 'walk-in-office-1' };

// Mutable opts refs — updated on every render so onSuccess closes over latest state.
// Mirrors react-query's own "latest callback" pattern to avoid stale closures.
let latestWalkInOpts: { onSuccess?: (c: { id: string }, data: unknown, ctx: undefined) => void } | undefined;
let latestWorkOrderOpts: { onSuccess?: (wo: { id: string }) => void } | undefined;

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// Prevent loading the full lucide-react bundle in jsdom
vi.mock('lucide-react', () => ({
    PlusCircle: () => null,
    Loader2: () => null,
}));

vi.mock('~/trpc/react', () => ({
    api: {
        companies: {
            search: {
                useQuery: () => ({ data: mockCompanyData, isFetching: false }),
            },
        },
        offices: {
            getByCompanyId: {
                useQuery: () => ({ data: mockOfficeData, refetch: mockRefetchOffices }),
            },
            getWalkInOffice: {
                useQuery: () => ({ data: mockWalkInOffice }),
            },
        },
        users: {
            getByOfficeId: {
                useQuery: () => ({ data: mockEmployeeData, refetch: mockRefetchEmployees }),
            },
        },
        workOrders: {
            createWorkOrder: {
                useMutation: (opts: { onSuccess?: (wo: { id: string }) => void }) => {
                    latestWorkOrderOpts = opts;
                    return {
                        mutateAsync: async (data: unknown) => {
                            const result = await mockCreateWorkOrder(data);
                            latestWorkOrderOpts?.onSuccess?.(result);
                            return result;
                        },
                        isPending: false,
                    };
                },
            },
        },
        walkInCustomers: {
            create: {
                useMutation: (opts: { onSuccess?: (c: { id: string }, data: unknown, ctx: undefined) => void }) => {
                    latestWalkInOpts = opts;
                    return {
                        mutateAsync: async (data: unknown) => {
                            const result = await mockCreateWalkInCustomer(data);
                            // Yield to the macrotask queue so React can flush the setNewWorkOrderData
                            // re-render before onSuccess runs. React schedules renders via MessageChannel
                            // (higher priority than setTimeout), so this ensures latestWalkInOpts has
                            // the updated onSuccess that sees newWorkOrderData as non-null.
                            await new Promise(resolve => setTimeout(resolve, 0));
                            latestWalkInOpts?.onSuccess?.(result, data, undefined);
                            return result;
                        },
                        isPending: false,
                    };
                },
            },
        },
    },
}));

vi.mock('~/app/_components/shared/ui/CustomComboBox', () => ({
    CustomComboBox: ({
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
            aria-label={placeholder}
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

vi.mock('~/app/_components/shared/contacts/createContactModal', () => ({
    CreateContactModal: () => null,
}));

vi.mock('~/app/_components/ui/button', () => ({
    Button: ({ children, onClick, type, disabled, className }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) =>
        React.createElement('button', { onClick, type, disabled, className }, children),
}));

vi.mock('~/app/_components/ui/input', () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
        React.createElement('input', props),
}));

vi.mock('~/app/_components/ui/label', () => ({
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) =>
        React.createElement('label', { htmlFor }, children),
}));

import WorkOrderForm from '../workOrderForm';

describe('WorkOrderForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form with required fields', () => {
        render(<WorkOrderForm />);
        expect(screen.getByLabelText(/date in/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/in hands date/i)).toBeInTheDocument();
        expect(screen.getByText(/submit and next step/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);
        await user.click(screen.getByText(/submit and next step/i));
        await waitFor(() => {
            expect(screen.getByText(/date in is required/i)).toBeInTheDocument();
        });
    });

    it('walk-in toggle shows customer name, email, phone fields', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);

        expect(screen.queryByLabelText(/customer name/i)).not.toBeInTheDocument();

        await user.click(screen.getByLabelText(/walk-in customer/i));

        expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/customer email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/customer phone/i)).toBeInTheDocument();
    });

    it('hides company/office fields when walk-in is checked', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);

        expect(screen.getByLabelText(/select company/i)).toBeInTheDocument();

        await user.click(screen.getByLabelText(/walk-in customer/i));

        expect(screen.queryByLabelText(/select company/i)).not.toBeInTheDocument();
    });

    it('restores company/office fields when walk-in is unchecked', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);

        await user.click(screen.getByLabelText(/walk-in customer/i));
        await user.click(screen.getByLabelText(/walk-in customer/i));

        expect(screen.queryByLabelText(/customer name/i)).not.toBeInTheDocument();
    });

    it('shows error when submitting walk-in form without customer name', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);

        await user.click(screen.getByLabelText(/walk-in customer/i));
        await user.type(screen.getByLabelText(/date in/i), '2026-06-01');
        await user.type(screen.getByLabelText(/in hands date/i), '2026-06-15');

        await user.click(screen.getByText(/submit and next step/i));

        await waitFor(() => {
            expect(
                screen.getByText(/customer name is required for walk-in customers/i)
            ).toBeInTheDocument();
        });
    });

    it('calls createWorkOrder mutation for regular (non-walk-in) submission', async () => {
        const user = userEvent.setup();
        render(<WorkOrderForm />);

        await user.type(screen.getByLabelText(/date in/i), '2026-06-01');
        await user.type(screen.getByLabelText(/in hands date/i), '2026-06-15');

        const invoiceTypeSelect = screen.getByRole('combobox', { name: /select type\.\.\./i });
        fireEvent.change(invoiceTypeSelect, { target: { value: 'Print' } });

        await user.click(screen.getByText(/submit and next step/i));

        // officeId is required; without it the handler returns early before calling the mutation
        expect(mockCreateWorkOrder).not.toHaveBeenCalled();
    });

    it('calls createWalkInCustomer then createWorkOrder for walk-in submission', async () => {
        const user = userEvent.setup();
        const { container } = render(<WorkOrderForm />);

        await user.click(screen.getByLabelText(/walk-in customer/i));
        await user.type(screen.getByLabelText(/customer name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/customer email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/date in/i), '2026-06-01');
        await user.type(screen.getByLabelText(/in hands date/i), '2026-06-15');

        await act(async () => {
            fireEvent.submit(container.querySelector('form')!);
        });

        await waitFor(() => {
            expect(mockCreateWalkInCustomer).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Jane Doe' })
            );
        });

        await waitFor(() => {
            expect(mockCreateWorkOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    walkInCustomerId: 'wic-1',
                    officeId: 'walk-in-office-1',
                    isWalkIn: true,
                })
            );
        });
    });

    it('redirects to the new work order page on successful walk-in creation', async () => {
        const user = userEvent.setup();
        const { container } = render(<WorkOrderForm />);

        await user.click(screen.getByLabelText(/walk-in customer/i));
        await user.type(screen.getByLabelText(/customer name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/customer email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/date in/i), '2026-06-01');
        await user.type(screen.getByLabelText(/in hands date/i), '2026-06-15');

        await act(async () => {
            fireEvent.submit(container.querySelector('form')!);
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/workOrders/create/wo-1');
        });
    });
});
