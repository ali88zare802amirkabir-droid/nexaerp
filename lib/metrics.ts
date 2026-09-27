import type {
  Customer,
  CustomerNote,
  Employee,
  Expense,
  Invoice,
  Order,
  Product,
  Project,
  Task,
} from "@/lib/types";
import { MONTH_LABELS, MONTH_OFFSETS } from "@/data/reports";

export interface TrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface InventoryStats {
  totalItems: number;
  totalUnits: number;
  stockValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  lowStockValue: number;
  statusData: Array<{ name: string; value: number; color: string }>;
  categoryData: Array<{ category: string; units: number }>;
}

export interface SalesStats {
  revenue30: number;
  ordersCount: number;
  aov: number;
  conversion: number;
  orderTrend: Array<{ month: string; revenue: number }>;
  topCustomers: Array<{ id: string; name: string; company: string; revenue: number }>;
}

export interface ProjectTasks {
  active: number;
  onTrack: number;
  atRisk: number;
  onHold: number;
  completed: number;
  openTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  dueThisWeek: number;
  overdueTasks: number;
  openTotal: number;
}

export interface TimelineItem {
  id: string;
  kind: string;
  title: string;
  desc: string;
  daysAgo: number;
}

export function financialTrend(
  invoices: Invoice[],
  expenses: Expense[]
): { trend: TrendPoint[]; monthlyRevenue: number; monthlyExpenses: number; monthlyProfit: number } {
  const sumBy = <T extends { monthOffset: number }>(
    arr: T[],
    pick: (x: T) => number,
    k: number
  ): number => arr.filter((a) => a.monthOffset === k).reduce((s, a) => s + pick(a), 0);
  const revenueOf = (i: Invoice) => (i.status === "Paid" ? i.amount : 0);
  const trend: TrendPoint[] = MONTH_OFFSETS.map((off) => {
    const revenue = sumBy(invoices, revenueOf, off);
    const expensesM = sumBy(expenses, (e: Expense) => e.amount, off);
    return { month: MONTH_LABELS[off], revenue, expenses: expensesM, profit: revenue - expensesM };
  });
  const current = trend[trend.length - 1];
  return {
    trend,
    monthlyRevenue: current.revenue,
    monthlyExpenses: current.expenses,
    monthlyProfit: current.profit,
  };
}

const STATUS_COLORS: Record<string, string> = {
  "In Stock": "#34d399",
  "Low Stock": "#fbbf24",
  "Out of Stock": "#fb7185",
};

export function computeInventoryStats(products: Product[]): InventoryStats {
  const statusCount = (s: string) => products.filter((p) => p.status === s).length;
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);
  const stockValue = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const lowStockValue = products
    .filter((p) => p.status === "Low Stock" || p.status === "Out of Stock")
    .reduce((s, p) => s + p.quantity * p.price, 0);
  const cats = [...new Set(products.map((p) => p.category))];
  return {
    totalItems: products.length,
    totalUnits,
    stockValue,
    inStock: statusCount("In Stock"),
    lowStock: statusCount("Low Stock"),
    outOfStock: statusCount("Out of Stock"),
    lowStockValue,
    statusData: ["In Stock", "Low Stock", "Out of Stock"].map((name) => ({
      name,
      value: statusCount(name),
      color: STATUS_COLORS[name],
    })),
    categoryData: cats.map((category) => ({
      category,
      units: products.filter((p) => p.category === category).reduce((s, p) => s + p.quantity, 0),
    })),
  };
}

export function computeSalesStats(
  orders: Order[],
  customers: Customer[]
): SalesStats {
  const revenueOf = (o: Order) => (o.status === "Cancelled" ? 0 : o.total);
  const current = orders.filter((o) => o.monthOffset === 0);
  const revenue30 = current.reduce((s, o) => s + revenueOf(o), 0);
  const ordersCount = current.length;
  const aov = ordersCount ? revenue30 / ordersCount : 0;
  const conversion = orders.length
    ? orders.filter((o) => o.status !== "Cancelled").length / orders.length
    : 0;
  const orderTrend = [...MONTH_OFFSETS]
    .reverse()
    .map((off) => ({
      month: MONTH_LABELS[off],
      revenue: orders.filter((o) => o.monthOffset === off).reduce((s, o) => s + revenueOf(o), 0),
    }));
  const byCustomer = new Map<string, number>();
  for (const o of orders) {
    if (o.status === "Cancelled") continue;
    byCustomer.set(o.customerId, (byCustomer.get(o.customerId) ?? 0) + o.total);
  }
  const topCustomers = [...byCustomer.entries()]
    .map(([id, revenue]) => {
      const c = customers.find((x) => x.id === id);
      return { id, name: c?.name ?? "", company: c?.company ?? "", revenue };
    })
    .filter((c) => c.name)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
  return { revenue30, ordersCount, aov, conversion, orderTrend, topCustomers };
}

export function projectTaskStats(
  projects: Project[],
  tasks: Task[]
): {
  projects: ProjectTasks;
  openPending: number;
  totalBudget: number;
  totalSpent: number;
} {
  const active = projects.filter((p) => p.status !== "Completed").length;
  const openTasks = tasks.filter((t) => t.status === "Open").length;
  const openTotal = tasks.filter((t) => t.status !== "Done").length;
  return {
    projects: {
      active,
      onTrack: projects.filter((p) => p.status === "On Track").length,
      atRisk: projects.filter((p) => p.status === "At Risk").length,
      onHold: projects.filter((p) => p.status === "On Hold").length,
      completed: projects.filter((p) => p.status === "Completed").length,
      openTasks,
      inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
      doneTasks: tasks.filter((t) => t.status === "Done").length,
      dueThisWeek: tasks.filter((t) => t.status !== "Done" && t.dueOffset >= 0 && t.dueOffset <= 7).length,
      overdueTasks: tasks.filter((t) => t.status !== "Done" && t.dueOffset < 0).length,
      openTotal,
    },
    openPending: tasks.filter((t) => t.status === "Open").length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalSpent: projects.reduce((s, p) => s + p.spent, 0),
  };
}

export function depPerformance(employees: Employee[]): Array<{ department: string; avg: number }> {
  const deps = [...new Set(employees.map((e) => e.department))];
  return deps
    .map((department) => {
      const list = employees.filter((e) => e.department === department);
      const avg = Math.round(list.reduce((s, e) => s + e.performance, 0) / list.length);
      return { department, avg };
    })
    .sort((a, b) => b.avg - a.avg);
}

export function performanceRating(p: number): string {
  if (p >= 90) return "Exceptional";
  if (p >= 82) return "Strong";
  if (p >= 74) return "Solid";
  return "Developing";
}

export function employeeActivity(
  employeeId: string,
  tasks: Task[],
  projects: Project[]
): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const t of tasks.filter((t) => t.assigneeId === employeeId)) {
    items.push({
      id: `ta-${t.id}`,
      kind: "task",
      title: t.status === "Done" ? "Completed task" : t.status,
      desc: t.title,
      daysAgo: t.createdDaysAgo,
    });
  }
  for (const p of projects.filter((p) => p.teamIds.includes(employeeId))) {
    items.push({
      id: `pr-${p.id}`,
      kind: "project",
      title: p.status === "Completed" ? "Delivered project" : "Working on",
      desc: p.name,
      daysAgo: p.startedDaysAgo,
    });
  }
  return items.sort((a, b) => a.daysAgo - b.daysAgo);
}

export function buildCustomerTimeline(
  customerId: string,
  orders: Order[],
  invoices: Invoice[],
  notes: CustomerNote[]
): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const o of orders.filter((o) => o.customerId === customerId)) {
    items.push({
      id: `o-${o.id}`,
      kind: "order",
      title: `Order ${o.number}`,
      desc: `${o.itemsCount} items · ${o.total.toLocaleString("en-US")} · ${o.status}`,
      daysAgo: o.daysAgo,
    });
  }
  for (const i of invoices.filter((i) => i.customerId === customerId)) {
    items.push({
      id: `i-${i.id}`,
      kind: "invoice",
      title: `Invoice ${i.number} · ${i.status}`,
      desc: i.title,
      daysAgo: i.daysAgo,
    });
  }
  for (const n of notes.filter((n) => n.customerId === customerId)) {
    items.push({
      id: `n-${n.id}`,
      kind: "note",
      title: "Note added",
      desc: n.body,
      daysAgo: n.daysAgo,
    });
  }
  return items.sort((a, b) => a.daysAgo - b.daysAgo);
}

export function moneyCompact(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}