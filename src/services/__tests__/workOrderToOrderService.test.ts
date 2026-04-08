import { describe, it, expect } from "vitest";
import { Prisma } from "~/generated/prisma/client";

const SALES_TAX = 0.07;

// Extracted from workOrderToOrderService.ts for testing
function calculateTotals(
  workOrderItems: Array<{
    cost: Prisma.Decimal | null;
    amount: Prisma.Decimal | null;
    shippingAmount: Prisma.Decimal | null;
  }>
) {
  const totalCost = workOrderItems.reduce(
    (sum, item) => sum.add(item.cost || new Prisma.Decimal(0)),
    new Prisma.Decimal(0)
  );

  const totalItemAmount = workOrderItems.reduce(
    (sum, item) => sum.add(item.amount || new Prisma.Decimal(0)),
    new Prisma.Decimal(0)
  );

  const totalShippingAmount = workOrderItems.reduce(
    (sum, item) => sum.add(item.shippingAmount || new Prisma.Decimal(0)),
    new Prisma.Decimal(0)
  );

  const totalAmount = totalItemAmount.add(totalShippingAmount);
  const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
  const calculatedSubTotal = totalAmount.sub(calculatedSalesTax);

  return {
    totalCost,
    totalItemAmount,
    totalShippingAmount,
    totalAmount,
    calculatedSalesTax,
    calculatedSubTotal,
  };
}

describe("calculateTotals (Decimal arithmetic)", () => {
  it("sums costs, amounts, and shipping", () => {
    const items = [
      {
        cost: new Prisma.Decimal("10.50"),
        amount: new Prisma.Decimal("20.00"),
        shippingAmount: new Prisma.Decimal("5.00"),
      },
      {
        cost: new Prisma.Decimal("7.25"),
        amount: new Prisma.Decimal("15.00"),
        shippingAmount: new Prisma.Decimal("3.00"),
      },
    ];

    const result = calculateTotals(items);

    expect(result.totalCost.toString()).toBe("17.75");
    expect(result.totalItemAmount.toString()).toBe("35");
    expect(result.totalShippingAmount.toString()).toBe("8");
    expect(result.totalAmount.toString()).toBe("43");
    expect(result.calculatedSalesTax.toString()).toBe("2.45");
    expect(result.calculatedSubTotal.toString()).toBe("40.55");
  });

  it("handles null values as zero", () => {
    const items = [
      { cost: null, amount: new Prisma.Decimal("10.00"), shippingAmount: null },
    ];

    const result = calculateTotals(items);

    expect(result.totalCost.toString()).toBe("0");
    expect(result.totalItemAmount.toString()).toBe("10");
    expect(result.totalShippingAmount.toString()).toBe("0");
  });

  it("handles empty items array", () => {
    const result = calculateTotals([]);

    expect(result.totalCost.toString()).toBe("0");
    expect(result.totalAmount.toString()).toBe("0");
  });

  it("Decimal constructor and arithmetic work correctly", () => {
    const d = new Prisma.Decimal("123.456");
    expect(d.add(new Prisma.Decimal("0.544")).toString()).toBe("124");
    expect(d.mul(2).toString()).toBe("246.912");
  });
});
