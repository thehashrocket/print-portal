import { vi, describe, it, expect } from 'vitest';
import { createCallerFactory } from '~/server/api/trpc';
import { orderNoteRouter } from '../orderNotes';

// Covers the ownership gate added for issue #511: order notes are keyed only by
// their own id, so update/delete must verify the caller is the note's creator
// or an Admin. getByID/getAll are now protected (issue #508) — exercised via
// the protectedProcedure path implicitly by every call here using a session.

const createCaller = createCallerFactory(orderNoteRouter);

function session(userId: string, roles: string[] = []) {
    return {
        user: { id: userId, name: 'Test', email: 't@example.com', Roles: roles, Permissions: [] },
        expires: '2099-01-01',
    };
}

function makeDb(existing: { createdById: string } | null) {
    return {
        orderNote: {
            findUnique: vi.fn().mockResolvedValue(existing),
            update: vi.fn().mockResolvedValue({ id: 'note-1', note: 'updated' }),
            delete: vi.fn().mockResolvedValue({ id: 'note-1' }),
        },
    };
}

describe('orderNoteRouter.update — ownership gate (#511)', () => {
    it('allows the note creator to update', async () => {
        const db = makeDb({ createdById: 'user-1' });
        const caller = createCaller({ db, session: session('user-1') } as any);

        await caller.update({ id: 'note-1', note: 'updated' });

        expect(db.orderNote.update).toHaveBeenCalledTimes(1);
    });

    it('allows an Admin who is not the creator to update', async () => {
        const db = makeDb({ createdById: 'someone-else' });
        const caller = createCaller({ db, session: session('admin-1', ['Admin']) } as any);

        await caller.update({ id: 'note-1', note: 'updated' });

        expect(db.orderNote.update).toHaveBeenCalledTimes(1);
    });

    it('forbids a non-owner, non-admin from updating', async () => {
        const db = makeDb({ createdById: 'someone-else' });
        const caller = createCaller({ db, session: session('user-2') } as any);

        await expect(caller.update({ id: 'note-1', note: 'updated' })).rejects.toMatchObject({
            code: 'FORBIDDEN',
        });
        expect(db.orderNote.update).not.toHaveBeenCalled();
    });

    it('returns NOT_FOUND when the note does not exist', async () => {
        const db = makeDb(null);
        const caller = createCaller({ db, session: session('user-1') } as any);

        await expect(caller.update({ id: 'missing', note: 'x' })).rejects.toMatchObject({
            code: 'NOT_FOUND',
        });
        expect(db.orderNote.update).not.toHaveBeenCalled();
    });
});

describe('orderNoteRouter.delete — ownership gate (#511)', () => {
    it('allows the note creator to delete', async () => {
        const db = makeDb({ createdById: 'user-1' });
        const caller = createCaller({ db, session: session('user-1') } as any);

        await caller.delete('note-1');

        expect(db.orderNote.delete).toHaveBeenCalledTimes(1);
    });

    it('forbids a non-owner, non-admin from deleting', async () => {
        const db = makeDb({ createdById: 'someone-else' });
        const caller = createCaller({ db, session: session('user-2') } as any);

        await expect(caller.delete('note-1')).rejects.toMatchObject({ code: 'FORBIDDEN' });
        expect(db.orderNote.delete).not.toHaveBeenCalled();
    });
});
