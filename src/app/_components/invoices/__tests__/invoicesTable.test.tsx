// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('lucide-react', () => ({
  Eye: () => null,
  FileSearch: ({ className }: { className?: string }) =>
    React.createElement('svg', { 'data-testid': 'file-search-icon', className }),
  RefreshCcw: () => null,
  RefreshCwOff: () => null,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    React.createElement('a', { href, className }, children),
}));

vi.mock('~/trpc/react', () => ({
  api: {
    invoices: {
      getAll: {
        useQuery: () => ({ data: [], isLoading: false }),
        invalidate: vi.fn(),
      },
    },
    useUtils: () => ({
      invoices: { getAll: { invalidate: vi.fn() } },
    }),
  },
}));

vi.mock('../QuickbooksInvoiceButton', () => ({
  default: () => null,
}));

vi.mock('@ag-grid-community/react', () => ({
  AgGridReact: () => React.createElement('div', { 'data-testid': 'ag-grid' }),
}));

vi.mock('@ag-grid-community/client-side-row-model', () => ({
  ClientSideRowModelModule: {},
}));

vi.mock('@ag-grid-community/core', () => ({
  ModuleRegistry: { registerModules: vi.fn() },
}));

vi.mock('@ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('@ag-grid-community/styles/ag-theme-alpine.css', () => ({}));

import InvoicesTable from '../invoicesTable';

describe('InvoicesTable', () => {
  it('renders empty state when invoices array is empty', () => {
    render(<InvoicesTable />);
    expect(screen.getByText('No invoices found')).toBeTruthy();
  });

  it('empty state shows explanatory paragraph', () => {
    render(<InvoicesTable />);
    expect(
      screen.getByText(/Invoices will appear here once they are created from orders/i)
    ).toBeTruthy();
  });

  it('empty state renders FileSearch icon', () => {
    render(<InvoicesTable />);
    expect(screen.getByTestId('file-search-icon')).toBeTruthy();
  });

  it('empty state View Orders link points to /orders', () => {
    render(<InvoicesTable />);
    const link = screen.getByRole('link', { name: /view orders/i });
    expect(link).toBeTruthy();
    expect((link as HTMLAnchorElement).href).toContain('/orders');
  });
});

