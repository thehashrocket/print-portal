import { Prisma } from "~/generated/prisma/client";

export const SALES_TAX = 0.07;

type CalculableItem = {
  amount: Prisma.Decimal | null;
  cost: Prisma.Decimal | null;
  shippingAmount: Prisma.Decimal | null;
  status?: string;
};

export type ItemTotals = {
  totalItemAmount: Prisma.Decimal;
  totalShippingAmount: Prisma.Decimal;
  totalCost: Prisma.Decimal;
  calculatedSubTotal: Prisma.Decimal;
  calculatedSalesTax: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
};

export function calculateItemTotals(
  items: CalculableItem[],
  { filterCancelled = false }: { filterCancelled?: boolean } = {}
): ItemTotals {
  const activeItems = filterCancelled
    ? items.filter((item) => item.status !== "Cancelled")
    : items;

  const totalItemAmount = activeItems.reduce(
    (sum, item) => sum.add(item.amount ?? 0),
    new Prisma.Decimal(0)
  );
  const totalShippingAmount = activeItems.reduce(
    (sum, item) => sum.add(item.shippingAmount ?? 0),
    new Prisma.Decimal(0)
  );
  const totalCost = activeItems.reduce(
    (sum, item) => sum.add(item.cost ?? 0),
    new Prisma.Decimal(0)
  );
  const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
  const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
  const totalAmount = calculatedSubTotal.add(calculatedSalesTax);

  return {
    totalItemAmount,
    totalShippingAmount,
    totalCost,
    calculatedSubTotal,
    calculatedSalesTax,
    totalAmount,
  };
}
