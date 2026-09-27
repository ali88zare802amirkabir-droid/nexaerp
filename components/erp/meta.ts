import type { Tone } from "@/components/ui/badge";
import type {
  CustomerStatus,
  Department,
  EmployeeStatus,
  InvoiceStatus,
  OrderStatus,
  ProductStatus,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

export const EMPLOYEE_STATUS_TONE: Record<EmployeeStatus, Tone> = {
  Active: "ok",
  "On Leave": "warn",
  Contract: "cyan",
  Probation: "accent",
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, Tone> = {
  "In Stock": "ok",
  "Low Stock": "warn",
  "Out of Stock": "danger",
};

export const CUSTOMER_STATUS_TONE: Record<CustomerStatus, Tone> = {
  Active: "ok",
  New: "accent",
  VIP: "cyan",
  "At Risk": "danger",
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, Tone> = {
  Paid: "ok",
  Pending: "warn",
  Overdue: "danger",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  Shipped: "accent",
  Processing: "warn",
  Delivered: "ok",
  Cancelled: "neutral",
};

export const PROJECT_STATUS_TONE: Record<ProjectStatus, Tone> = {
  "On Track": "ok",
  "At Risk": "warn",
  "On Hold": "neutral",
  Completed: "cyan",
};

export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  Open: "neutral",
  "In Progress": "accent",
  Done: "ok",
};

export const PROJECT_TONE_DOT: Record<ProjectStatus, string> = {
  "On Track": "#34d399",
  "At Risk": "#fbbf24",
  "On Hold": "#64748b",
  Completed: "#35d3f2",
};

export const TASK_PRIORITY_TONE: Record<TaskPriority, Tone> = {
  High: "danger",
  Medium: "warn",
  Low: "neutral",
};

export const DEPT_COLOR: Record<Department, string> = {
  Engineering: "#a78bfa",
  Product: "#35d3f2",
  Design: "#f472b6",
  Sales: "#fbbf24",
  Marketing: "#fb7185",
  Finance: "#34d399",
  Operations: "#55a1ff",
  Support: "#38bdf8",
  HR: "#f97316",
};