import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { Prisma } from "~/generated/prisma/client";

// Extracted from invoices/[id]/page.tsx for testing
function serializeDecimal(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Decimal || obj instanceof Prisma.Decimal) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, serializeDecimal(value)])
  );
}

describe("serializeDecimal", () => {
  it("converts Decimal instances to strings", () => {
    const d = new Decimal("123.45");
    expect(serializeDecimal(d)).toBe("123.45");
  });

  it("passes through primitives", () => {
    expect(serializeDecimal(null)).toBeNull();
    expect(serializeDecimal("hello")).toBe("hello");
    expect(serializeDecimal(42)).toBe(42);
  });

  it("serializes nested objects with Decimals", () => {
    const obj = {
      name: "test",
      amount: new Decimal("99.99"),
      nested: {
        tax: new Decimal("7.00"),
      },
    };

    const result = serializeDecimal(obj);
    expect(result.amount).toBe("99.99");
    expect(result.nested.tax).toBe("7");
    expect(result.name).toBe("test");
  });

  it("serializes arrays with Decimals", () => {
    const arr = [new Decimal("1.1"), new Decimal("2.2")];
    const result = serializeDecimal(arr);
    expect(result).toEqual(["1.1", "2.2"]);
  });

  it("converts Prisma.Decimal instances to strings", () => {
    const d = new Prisma.Decimal("456.78");
    expect(serializeDecimal(d)).toBe("456.78");
  });

  it("handles mixed Decimal types in nested objects", () => {
    const obj = {
      amount: new Decimal("10.00"),
      prismaAmount: new Prisma.Decimal("20.00"),
    };
    const result = serializeDecimal(obj);
    expect(result.amount).toBe("10");
    expect(result.prismaAmount).toBe("20");
  });
});
