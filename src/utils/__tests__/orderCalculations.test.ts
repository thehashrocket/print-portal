import { describe, it, expect } from "vitest";
import { Prisma } from "~/generated/prisma/client";
import { calculateItemTotals, SALES_TAX } from "~/utils/orderCalculations";

const dec = (v: string) => new Prisma.Decimal(v);

describe("calculateItemTotals", () => {
  it("returns all zeros for an empty array", () => {
    const result = calculateItemTotals([]);
    expect(result.totalItemAmount.toString()).toBe("0");
    expect(result.totalShippingAmount.toString()).toBe("0");
    expect(result.totalCost.toString()).toBe("0");
    expect(result.calculatedSubTotal.toString()).toBe("0");
    expect(result.calculatedSalesTax.toString()).toBe("0");
    expect(result.totalAmount.toString()).toBe("0");
  });

  it("sums amounts, shipping, and cost across items", () => {
    const items = [
      { amount: dec("20.00"), shippingAmount: dec("5.00"), cost: dec("10.50") },
      { amount: dec("15.00"), shippingAmount: dec("3.00"), cost: dec("7.25") },
    ];
    const result = calculateItemTotals(items);

    expect(result.totalItemAmount.toString()).toBe("35");
    expect(result.totalShippingAmount.toString()).toBe("8");
    expect(result.totalCost.toString()).toBe("17.75");
  });

  it("computes subTotal = itemAmount + shipping, totalAmount = subTotal + salesTax", () => {
    const items = [
      { amount: dec("35.00"), shippingAmount: dec("8.00"), cost: dec("0") },
    ];
    const result = calculateItemTotals(items);

    // subTotal = 35 + 8 = 43
    expect(result.calculatedSubTotal.toString()).toBe("43");
    // salesTax = 35 * 0.07 = 2.45
    expect(result.calculatedSalesTax.toString()).toBe("2.45");
    // totalAmount = 43 + 2.45 = 45.45
    expect(result.totalAmount.toString()).toBe("45.45");
  });

  it("applies sales tax to itemAmount only, not shipping", () => {
    const items = [
      { amount: dec("100.00"), shippingAmount: dec("20.00"), cost: dec("0") },
    ];
    const result = calculateItemTotals(items);

    expect(result.calculatedSalesTax.toNumber()).toBeCloseTo(100 * SALES_TAX, 10);
    expect(result.totalAmount.toString()).toBe("127");
  });

  it("treats null amount, cost, and shippingAmount as zero", () => {
    const items = [
      { amount: null, cost: null, shippingAmount: null },
      { amount: dec("10.00"), cost: null, shippingAmount: null },
    ];
    const result = calculateItemTotals(items);

    expect(result.totalItemAmount.toString()).toBe("10");
    expect(result.totalCost.toString()).toBe("0");
    expect(result.totalShippingAmount.toString()).toBe("0");
  });

  it("includes all items when filterCancelled is false (default)", () => {
    const items = [
      { amount: dec("10.00"), shippingAmount: null, cost: null, status: "Cancelled" },
      { amount: dec("20.00"), shippingAmount: null, cost: null, status: "Pending" },
    ];
    const result = calculateItemTotals(items);
    expect(result.totalItemAmount.toString()).toBe("30");
  });

  it("excludes Cancelled items when filterCancelled is true", () => {
    const items = [
      { amount: dec("10.00"), shippingAmount: null, cost: null, status: "Cancelled" },
      { amount: dec("20.00"), shippingAmount: null, cost: null, status: "Pending" },
      { amount: dec("5.00"), shippingAmount: null, cost: null, status: "Cancelled" },
    ];
    const result = calculateItemTotals(items, { filterCancelled: true });
    expect(result.totalItemAmount.toString()).toBe("20");
  });
});
