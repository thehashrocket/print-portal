import { throwForbidden, throwNotFound } from "~/server/api/errors";

/**
 * Authorize a note mutation (update/delete).
 *
 * Notes are keyed only by their own id, so without this check any authenticated
 * user could edit or delete any note by guessing/knowing its id. Mutations are
 * allowed only for the note's creator or an Admin.
 *
 *   existing == null ─────────────► throwNotFound (404)
 *   creator OR Admin ─────────────► allowed
 *   otherwise ────────────────────► throwForbidden (403)
 *
 * Narrows `existing` to non-null on return (throwNotFound returns `never`).
 */
export function assertNoteOwnership(
    existing: { createdById: string } | null,
    ctx: { session: { user: { id: string; Roles?: string[] } } },
    resource: string,
): asserts existing is { createdById: string } {
    if (!existing) {
        throwNotFound(resource);
    }
    const isOwner = existing.createdById === ctx.session.user.id;
    // Roles is optional on the session type (next-auth.d.ts) — a degraded
    // session lookup can omit it, so default to [] rather than throwing.
    const isAdmin = (ctx.session.user.Roles ?? []).includes("Admin");
    if (!isOwner && !isAdmin) {
        throwForbidden("You can only modify notes you created");
    }
}
