export const WAREHOUSES = [
  "Main · A1",
  "Main · B2",
  "West · C1",
  "East · A3",
  "North · B1",
];

export const PRODUCT_CATEGORIES = [
  "Computers",
  "Displays",
  "Peripherals",
  "Networking",
  "Storage",
  "Printing",
  "Projectors",
  "Furniture",
  "Supplies",
  "Accessories",
];

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Support",
  "HR",
] as const;

/** Deterministic month labels for the 8 reporting buckets (offset 0 = current month). */
export const MONTH_LABELS: Record<number, string> = {
  0: "Sep",
  1: "Aug",
  2: "Jul",
  3: "Jun",
  4: "May",
  5: "Apr",
  6: "Mar",
  7: "Feb",
};

export const MONTH_OFFSETS = [7, 6, 5, 4, 3, 2, 1, 0] as const;