import type { ActivityItem, NotificationItem } from "@/lib/types";

export const activities: ActivityItem[] = [
  { id: "ac-01", kind: "inventory", title: "NexMouse MX3 Wireless restocked", desc: "240 units arrived at Main · A1", minsAgo: 12 },
  { id: "ac-02", kind: "invoice", title: "Invoice INV-0142 paid", desc: "Northwind Systems · $48,250", minsAgo: 25 },
  { id: "ac-03", kind: "employee", title: "Mahsa Kiani completed onboarding", desc: "Sales · moved to probation tracking", minsAgo: 58 },
  { id: "ac-04", kind: "project", title: "Warehouse Automation at 68%", desc: "Phase 2 wiring finished ahead of schedule", minsAgo: 95 },
  { id: "ac-05", kind: "customer", title: "New customer onboarded", desc: "Maison Verre · first quote sent", minsAgo: 140 },
  { id: "ac-06", kind: "task", title: "Cart-sidebar state sync flagged", desc: "PRJ-2403 · high priority, due today", minsAgo: 210 },
  { id: "ac-07", kind: "finance", title: "Q3 expense report closed", desc: "Operations expenses under budget by 4%", minsAgo: 300 },
  { id: "ac-08", kind: "inventory", title: "Stock alert raised", desc: "NexPrint Color LaserJet is low (11 left)", minsAgo: 380 },
  { id: "ac-09", kind: "employee", title: "Promotion applied", desc: "Hossein Radpour → Senior Engineer, Engineering", minsAgo: 460 },
  { id: "ac-10", kind: "project", title: "Brand Refresh design freeze", desc: "Token list approved for migration", minsAgo: 590 },
  { id: "ac-11", kind: "invoice", title: "Invoice INV-0146 paid", desc: "Helios Energy · $19,500", minsAgo: 720 },
  { id: "ac-12", kind: "customer", title: "Renewal signed", desc: "Kansai Office Supply · 12-month agreement", minsAgo: 900 },
  { id: "ac-13", kind: "task", title: "Offline-first sync design submitted", desc: "PRJ-2412 · ERP Mobile Companion", minsAgo: 1140 },
  { id: "ac-14", kind: "finance", title: "Budget review conducted", desc: "Distribution Center reforecast approved", minsAgo: 1380 },
];

export const notifications: NotificationItem[] = [
  { id: "nt-01", kind: "task", title: "Task due today", desc: "Fix cart-sidebar state sync · PRJ-2403", minsAgo: 8, read: false },
  { id: "nt-02", kind: "inventory", title: "3 items out of stock", desc: "NexBook Air 13, NexGate Gateway, NexProject 1080", minsAgo: 32, read: false },
  { id: "nt-03", kind: "invoice", title: "2 invoices overdue", desc: "Alpine Rail · $11,800 · Rhein Klein · $14,600", minsAgo: 65, read: false },
  { id: "nt-04", kind: "employee", title: "New hire on probation", desc: "Mahsa Kiani completes week 6 next Friday", minsAgo: 130, read: true },
  { id: "nt-05", kind: "project", title: "PRJ-2403 is behind schedule", desc: "Relaunch slipping 6 days on the current plan", minsAgo: 240, read: true },
  { id: "nt-06", kind: "finance", title: "Q3 budget review ready", desc: "Report assembled for Operations review", minsAgo: 430, read: true },
];