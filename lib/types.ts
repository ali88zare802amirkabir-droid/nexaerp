export type Department =
  | "Engineering"
  | "Product"
  | "Design"
  | "Sales"
  | "Marketing"
  | "Finance"
  | "Operations"
  | "Support"
  | "HR";

export type EmployeeStatus = "Active" | "On Leave" | "Contract" | "Probation";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  role: string;
  status: EmployeeStatus;
  joinedDaysAgo: number;
  managerId: string | null;
  avatarColor: string;
  performance: number;
  tasksDoneMonth: number;
  tasksOpen: number;
}

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  status: ProductStatus;
  warehouse: string;
  updatedDaysAgo: number;
  price: number;
  cost: number;
}

export type CustomerStatus = "Active" | "New" | "VIP" | "At Risk";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  sinceDaysAgo: number;
  region: string;
  avatarColor: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  authorId: string;
  body: string;
  daysAgo: number;
}

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  title: string;
  amount: number;
  status: InvoiceStatus;
  monthOffset: number;
  daysAgo: number;
}

export type OrderStatus = "Shipped" | "Processing" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  number: string;
  customerId: string;
  itemsCount: number;
  total: number;
  status: OrderStatus;
  monthOffset: number;
  daysAgo: number;
}

export type ExpenseCategory =
  | "Operations"
  | "Rent"
  | "Software"
  | "Marketing"
  | "Trainings"
  | "Travel";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  monthOffset: number;
  daysAgo: number;
}

export type ProjectStatus = "On Track" | "At Risk" | "On Hold" | "Completed";

export interface Project {
  id: string;
  name: string;
  code: string;
  leadId: string;
  teamIds: string[];
  progress: number;
  status: ProjectStatus;
  dueOffset: number;
  budget: number;
  spent: number;
  startedDaysAgo: number;
}

export type TaskStatus = "Open" | "In Progress" | "Done";

export type TaskPriority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  projectId: string | null;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueOffset: number;
  createdDaysAgo: number;
}

export type ActivityKind =
  | "employee"
  | "invoice"
  | "inventory"
  | "project"
  | "task"
  | "customer"
  | "finance";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  desc: string;
  minsAgo: number;
}

export type NotificationKind =
  | "employee"
  | "invoice"
  | "inventory"
  | "project"
  | "task"
  | "finance"
  | "customer";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  desc: string;
  minsAgo: number;
  read: boolean;
}

export type Currency = "USD" | "EUR" | "GBP";

export interface AppSettings {
  companyName: string;
  currency: Currency;
  timezone: string;
  fiscalYearStart: string;
  density: boolean;
  reduceMotion: boolean;
  notifInvoices: boolean;
  notifInventory: boolean;
  notifProjects: boolean;
  notifTeam: boolean;
}

export interface Profile {
  name: string;
  email: string;
  role: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  desc?: string;
  variant: "success" | "info" | "danger";
}