import { TRPCError } from "@trpc/server";

export function throwNotFound(resource: string): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `${resource} not found` });
}

export function throwForbidden(message = "You don't have permission to perform this action"): never {
  throw new TRPCError({ code: "FORBIDDEN", message });
}

export function throwUnauthorized(message = "Not authenticated"): never {
  throw new TRPCError({ code: "UNAUTHORIZED", message });
}

export function throwConflict(message: string): never {
  throw new TRPCError({ code: "CONFLICT", message });
}

function isPrismaKnownError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "clientVersion" in error
  );
}

// Converts known Prisma errors to typed TRPCErrors and re-throws unknown ones.
export function handlePrismaError(error: unknown): never {
  if (isPrismaKnownError(error)) {
    switch (error.code) {
      case "P2025":
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found", cause: error });
      case "P2002":
        throw new TRPCError({ code: "CONFLICT", message: "Record already exists", cause: error });
      case "P2003":
        throw new TRPCError({ code: "BAD_REQUEST", message: "Related record not found", cause: error });
    }
  }
  throw error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred", cause: error });
}
