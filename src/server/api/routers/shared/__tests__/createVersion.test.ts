import { vi, describe, it, expect } from 'vitest';
import { Prisma } from '~/generated/prisma/client';
import { buildChangedFields, createOrderVersion, createOrderItemVersion } from '../createVersion';

// ─── buildChangedFields ───────────────────────────────────────────────────────

describe('buildChangedFields', () => {
    it('returns a diff when a string field changes', () => {
        const result = buildChangedFields({ name: 'old' }, { name: 'new' });
        expect(result).toEqual({ name: { from: 'old', to: 'new' } });
    });

    it('excludes unchanged fields', () => {
        const result = buildChangedFields<Record<string, unknown>>({ name: 'same', qty: 5 }, { name: 'same' });
        expect(result).toBeUndefined();
    });

    it('handles Prisma Decimal fields via String() serialization', () => {
        const before = { deposit: new Prisma.Decimal('10.00') };
        const after = { deposit: new Prisma.Decimal('20.00') };
        const result = buildChangedFields(before, after);
        expect(result).toEqual({ deposit: { from: '10', to: '20' } });
    });

    it('captures null-clearing as a change', () => {
        const result = buildChangedFields<Record<string, unknown>>({ notes: 'some text' }, { notes: null });
        expect(result).toEqual({ notes: { from: 'some text', to: 'null' } });
    });

    it('returns undefined when nothing changed', () => {
        const result = buildChangedFields({ qty: 5 }, { qty: 5 });
        expect(result).toBeUndefined();
    });

    it('returns undefined for an empty after object', () => {
        const result = buildChangedFields({ qty: 5 }, {});
        expect(result).toBeUndefined();
    });

    it('detects boolean changes', () => {
        const result = buildChangedFields<Record<string, unknown>>({ active: true }, { active: false });
        expect(result).toEqual({ active: { from: 'true', to: 'false' } });
    });

    it('detects number changes', () => {
        const result = buildChangedFields<Record<string, unknown>>({ qty: 5 }, { qty: 10 });
        expect(result).toEqual({ qty: { from: '5', to: '10' } });
    });

    it('detects Date changes via String() serialization', () => {
        const d1 = new Date('2026-01-01');
        const d2 = new Date('2026-06-01');
        const result = buildChangedFields<Record<string, unknown>>({ dueDate: d1 }, { dueDate: d2 });
        expect(result).toEqual({ dueDate: { from: String(d1), to: String(d2) } });
    });
});

// ─── createOrderVersion ───────────────────────────────────────────────────────

describe('createOrderVersion', () => {
    it('calls db.orderVersion.create with correct fields and returns the record', async () => {
        const created = { id: 'ov-1', orderId: 'order-1', changedById: 'user-1' };
        const db = { orderVersion: { create: vi.fn().mockResolvedValue(created) } };

        const result = await createOrderVersion({
            db: db as any,
            orderId: 'order-1',
            changedById: 'user-1',
            previousStatus: 'Pending',
            newStatus: 'Completed',
        });

        expect(db.orderVersion.create).toHaveBeenCalledWith({
            data: {
                orderId: 'order-1',
                changedById: 'user-1',
                previousStatus: 'Pending',
                newStatus: 'Completed',
                changedFields: undefined,
            },
        });
        expect(result).toBe(created);
    });
});

// ─── createOrderItemVersion ───────────────────────────────────────────────────

describe('createOrderItemVersion', () => {
    it('calls db.orderItemVersion.create with correct fields and returns the record', async () => {
        const created = { id: 'oiv-1', orderItemId: 'item-1', orderId: 'order-1' };
        const db = { orderItemVersion: { create: vi.fn().mockResolvedValue(created) } };

        const result = await createOrderItemVersion({
            db: db as any,
            orderItemId: 'item-1',
            orderId: 'order-1',
            changedById: 'user-1',
            previousStatus: 'Pending',
            newStatus: 'Press',
        });

        expect(db.orderItemVersion.create).toHaveBeenCalledWith({
            data: {
                orderItemId: 'item-1',
                orderId: 'order-1',
                changedById: 'user-1',
                previousStatus: 'Pending',
                newStatus: 'Press',
                changedFields: undefined,
            },
        });
        expect(result).toBe(created);
    });
});
