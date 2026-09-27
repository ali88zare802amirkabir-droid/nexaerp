"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { activities as seedActivities, notifications as seedNotifications } from "@/data/activity";
import { customers as seedCustomers, customerNotes as seedNotes } from "@/data/customers";
import { employees as seedEmployees } from "@/data/employees";
import { expenses as seedExpenses } from "@/data/expenses";
import { invoices as seedInvoices, orders as seedOrders } from "@/data/invoices";
import { products as seedProducts } from "@/data/products";
import { projects as seedProjects, tasks as seedTasks } from "@/data/projects";
import {
  computeInventoryStats,
  computeSalesStats,
  financialTrend,
  projectTaskStats,
  buildCustomerTimeline,
} from "@/lib/metrics";
import type {
  AppSettings,
  Customer,
  CustomerNote,
  Currency,
  Employee,
  Expense,
  Invoice,
  NotificationKind,
  NotificationItem,
  Order,
  OrderStatus,
  Product,
  ProductStatus,
  Profile,
  Project,
  Task,
  TaskStatus,
  ToastMessage,
} from "@/lib/types";
import { deriveStatus } from "@/data/products";
import { formatMoney, uid } from "@/lib/utils";

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: "Nexa Industries",
  currency: "USD",
  timezone: "Asia/Tehran",
  fiscalYearStart: "April",
  density: false,
  reduceMotion: false,
  notifInvoices: true,
  notifInventory: true,
  notifProjects: true,
  notifTeam: true,
};

const DEFAULT_PROFILE: Profile = {
  name: "Ali Rezaei",
  email: "ali.rezaei@nexa.io",
  role: "Operations Lead",
};

export type Theme = "dark" | "light";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export type EmployeeDraft = Omit<Employee, "id" | "joinedDaysAgo" | "managerId" | "tasksDoneMonth" | "tasksOpen">;
export type ProductDraft = Omit<Product, "id" | "status" | "updatedDaysAgo">;
export type CustomerDraft = Omit<Customer, "id" | "sinceDaysAgo">;
export type InvoiceDraft = Omit<Invoice, "id" | "number">;
export type OrderDraft = Omit<Order, "id" | "number">;
export type ExpenseDraft = Omit<Expense, "id">;
export type ProjectDraft = Omit<Project, "id" | "code" | "spent" | "startedDaysAgo">;
export type TaskDraft = Omit<Task, "id" | "createdDaysAgo" | "status">;

interface AppStore {
  employees: Employee[];
  addEmployee: (draft: EmployeeDraft) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  products: Product[];
  addProduct: (draft: ProductDraft) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, addQty: number) => void;

  customers: Customer[];
  addCustomer: (draft: CustomerDraft) => void;
  notes: CustomerNote[];
  addNote: (customerId: string, body: string) => void;

  invoices: Invoice[];
  addInvoice: (draft: InvoiceDraft) => void;
  setInvoiceStatus: (id: string, status: Invoice["status"]) => void;

  orders: Order[];
  addOrder: (draft: OrderDraft) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  expenses: Expense[];
  addExpense: (draft: ExpenseDraft) => void;

  projects: Project[];
  addProject: (draft: ProjectDraft) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;

  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  activities: (typeof seedActivities)[number][];
  buildTimelineFor: (customerId: string) => ReturnType<typeof buildCustomerTimeline>;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  metrics: {
    financials: ReturnType<typeof financialTrend>;
    inventory: ReturnType<typeof computeInventoryStats>;
    sales: ReturnType<typeof computeSalesStats>;
    projects: ReturnType<typeof projectTaskStats>;
    employeesTotal: number;
    employeesActive: number;
    employeesLeave: number;
  };

  money: (value: number) => string;
  toasts: ToastMessage[];
  pushToast: (title: string, opts?: { desc?: string; variant?: ToastMessage["variant"] }) => void;
  dismissToast: (id: string) => void;

  theme: Theme;
  setTheme: (t: Theme) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const AppContext = createContext<AppStore | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => [...seedEmployees]);
  const [products, setProducts] = useState<Product[]>(() => [...seedProducts]);
  const [customers, setCustomers] = useState<Customer[]>(() => [...seedCustomers]);
  const [notes, setNotes] = useState<CustomerNote[]>(() => [...seedNotes]);
  const [invoices, setInvoices] = useState<Invoice[]>(() => [...seedInvoices]);
  const [orders, setOrders] = useState<Order[]>(() => [...seedOrders]);
  const [expenses, setExpenses] = useState<Expense[]>(() => [...seedExpenses]);
  const [projects, setProjects] = useState<Project[]>(() => [...seedProjects]);
  const [tasks, setTasks] = useState<Task[]>(() => [...seedTasks]);
  const [activities] = useState(() => [...seedActivities]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    ...seedNotifications,
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("nexaerp-theme") === "light" ? "light" : "dark";
  });
  const [settings, setSettings] = useState<AppSettings>(() =>
    readJSON<AppSettings>("nexaerp-settings", DEFAULT_SETTINGS)
  );
  const [profile, setProfile] = useState<Profile>(() =>
    readJSON<Profile>("nexaerp-profile", DEFAULT_PROFILE)
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    try {
      window.localStorage.setItem("nexaerp-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem("nexaerp-settings", JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem("nexaerp-profile", JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle("dense", settings.density);
    document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
  }, [settings.density, settings.reduceMotion]);

  const pushToast = useCallback<AppStore["pushToast"]>((title, opts) => {
    const id = uid();
    setToasts((prev) => [
      ...prev.slice(-3),
      { id, title, desc: opts?.desc, variant: opts?.variant ?? "success" },
    ]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);
  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const notify = useCallback(
    (kind: NotificationKind, title: string, desc: string, minsAgo = 0) => {
      setNotifications((prev) => [
        { id: `not-${uid()}`, kind, title, desc, minsAgo: minsAgo || 1, read: false },
        ...prev,
      ]);
    },
    []
  );

  /** ------- employees ------- */
  const addEmployee = useCallback<AppStore["addEmployee"]>((draft) => {
    setEmployees((prev) => [
      { ...draft, id: `e-${uid()}`, joinedDaysAgo: 0, managerId: null, tasksDoneMonth: 0, tasksOpen: 0 },
      ...prev,
    ]);
  }, []);

  const updateEmployee = useCallback((id: string, patch: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** ------- products ------- */
  const addProduct = useCallback<AppStore["addProduct"]>((draft) => {
    const status: ProductStatus = deriveStatus(draft.quantity, draft.reorderLevel);
    setProducts((prev) => [
      { ...draft, id: `p-${uid()}`, status, updatedDaysAgo: 0 },
      ...prev,
    ]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        next.status = deriveStatus(next.quantity, next.reorderLevel);
        return next;
      })
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const restockProduct = useCallback<AppStore["restockProduct"]>(
    (id, addQty) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const quantity = Math.max(0, p.quantity + addQty);
          return { ...p, quantity, status: deriveStatus(quantity, p.reorderLevel), updatedDaysAgo: 0 };
        })
      );
      const product = products.find((p) => p.id === id);
      if (product) {
        pushToast("Stock updated", { desc: `${product.name} · +${addQty} ${product.unit}` });
        notify("inventory", `${product.name} restocked`, `Added ${addQty} ${product.unit}`);
      }
    },
    [products, pushToast, notify]
  );

  /** ------- customers ------- */
  const addCustomer = useCallback<AppStore["addCustomer"]>((draft) => {
    setCustomers((prev) => [
      { ...draft, id: `cu-${uid()}`, sinceDaysAgo: 0 },
      ...prev,
    ]);
    pushToast("Customer created", { desc: draft.company });
    notify("customer", `${draft.company} onboarded`, draft.name);
  }, [pushToast, notify]);

  /** ------- invoices ------- */
  const addInvoice = useCallback<AppStore["addInvoice"]>((draft) => {
    const number = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoices((prev) => [{ ...draft, id: `inv-${uid()}`, number }, ...prev]);
  }, []);

  const setInvoiceStatus = useCallback((id: string, status: Invoice["status"]) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  /** ------- orders ------- */
  const addOrder = useCallback<AppStore["addOrder"]>((draft) => {
    const number = `ORD-${Math.floor(2100 + Math.random() * 900)}`;
    setOrders((prev) => [{ ...draft, id: `ord-${uid()}`, number }, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  /** ------- expenses ------- */
  const addExpense = useCallback<AppStore["addExpense"]>((draft) => {
    setExpenses((prev) => [{ ...draft, id: `ex-${uid()}` }, ...prev]);
  }, []);

  /** ------- projects ------- */
  const addProject = useCallback<AppStore["addProject"]>((draft) => {
    const code = `PRJ-${Math.floor(2400 + Math.random() * 90)}`;
    setProjects((prev) => [
      { ...draft, id: `pr-${uid()}`, code, spent: 0, startedDaysAgo: 0 },
      ...prev,
    ]);
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  /** ------- tasks ------- */
  const addTask = useCallback<AppStore["addTask"]>((draft) => {
    setTasks((prev) => [
      { ...draft, id: `t-${uid()}`, createdDaysAgo: 0, status: "Open" },
      ...prev,
    ]);
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** ------- notes ------- */
  const addNote = useCallback(
    (customerId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      setNotes((prev) => [
        { id: `n-${uid()}`, customerId, authorId: "e-01", body: trimmed, daysAgo: 0 },
        ...prev,
      ]);
      pushToast("Note added");
    },
    [pushToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const metrics = useMemo(() => {
    const financials = financialTrend(invoices, expenses);
    const inventory = computeInventoryStats(products);
    const sales = computeSalesStats(orders, customers);
    const projectsStats = projectTaskStats(projects, tasks);
    return {
      financials,
      inventory,
      sales,
      projects: projectsStats,
      employeesTotal: employees.length,
      employeesActive: employees.filter((e) => e.status === "Active").length,
      employeesLeave: employees.filter((e) => e.status === "On Leave").length,
    };
  }, [invoices, expenses, products, orders, customers, projects, tasks, employees]);

  const buildTimelineFor = useCallback(
    (customerId: string) => buildCustomerTimeline(customerId, orders, invoices, notes),
    [orders, invoices, notes]
  );

  const money = useCallback(
    (value: number) => formatMoney(value, CURRENCY_SYMBOLS[settings.currency]),
    [settings.currency]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      restockProduct,
      customers,
      addCustomer,
      notes,
      addNote,
      invoices,
      addInvoice,
      setInvoiceStatus,
      orders,
      addOrder,
      updateOrderStatus,
      expenses,
      addExpense,
      projects,
      addProject,
      updateProject,
      tasks,
      addTask,
      updateTaskStatus,
      deleteTask,
      activities,
      buildTimelineFor,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      metrics,
      money,
      toasts,
      pushToast,
      dismissToast,
      theme,
      setTheme,
      settings,
      updateSettings,
      profile,
      updateProfile,
      searchOpen,
      setSearchOpen,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
    }),
    [
      employees, addEmployee, updateEmployee, deleteEmployee,
      products, addProduct, updateProduct, deleteProduct, restockProduct,
      customers, addCustomer, notes, addNote,
      invoices, addInvoice, setInvoiceStatus,
      orders, addOrder, updateOrderStatus,
      expenses, addExpense,
      projects, addProject, updateProject,
      tasks, addTask, updateTaskStatus, deleteTask,
      activities, buildTimelineFor,
      notifications, markNotificationRead, markAllNotificationsRead,
      metrics, money, toasts, pushToast, dismissToast, theme, setTheme,
      settings, updateSettings, profile, updateProfile,
      searchOpen, setSearchOpen, sidebarCollapsed, toggleSidebar,
      mobileNavOpen, setMobileNavOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStoreProvider");
  return ctx;
}