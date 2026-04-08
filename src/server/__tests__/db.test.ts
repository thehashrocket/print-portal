import { describe, it, expect } from "vitest";
import { PrismaClient } from "~/generated/prisma/client";

describe("PrismaClient", () => {
  it("PrismaClient constructor is importable and is a function", () => {
    expect(typeof PrismaClient).toBe("function");
  });
});
