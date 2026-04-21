import { vi } from 'vitest';

vi.mock('~/server/db', () => ({
    db: {},
    createPrismaClient: vi.fn(),
}));

vi.mock('~/server/auth', () => ({
    getServerAuthSession: vi.fn().mockResolvedValue(null),
}));
