import type { Customer, CustomerNote } from "@/lib/types";

export const customers: Customer[] = [
  { id: "cu-01", name: "Daniel Moore", company: "Northwind Systems", email: "daniel@northwind.io", phone: "+1 (415) 555-0141", status: "VIP", sinceDaysAgo: 1980, region: "North America", avatarColor: "#55a1ff" },
  { id: "cu-02", name: "Sophie Turner", company: "Helios Energy", email: "sophie@helios-energy.com", phone: "+44 20 7946 0422", status: "Active", sinceDaysAgo: 1620, region: "EMEA", avatarColor: "#fbbf24" },
  { id: "cu-03", name: "Kenji Tanaka", company: "Sakura Retail Group", email: "kenji@sakura-retail.jp", phone: "+81 3 5555 0210", status: "VIP", sinceDaysAgo: 1440, region: "APAC", avatarColor: "#fb7185" },
  { id: "cu-04", name: "Maria González", company: "Andes Ventures", email: "maria@andesventures.co", phone: "+57 1 555 0198", status: "Active", sinceDaysAgo: 1180, region: "North America", avatarColor: "#34d399" },
  { id: "cu-05", name: "Omar Al-Farsi", company: "Gulf Trade & Co", email: "omar@gulftrade.me", phone: "+971 4 555 0223", status: "Active", sinceDaysAgo: 940, region: "MENA", avatarColor: "#35d3f2" },
  { id: "cu-06", name: "Hannah Weber", company: "Rhein Klein Industries", email: "hannah@rhein-klein.de", phone: "+49 30 555 0117", status: "At Risk", sinceDaysAgo: 860, region: "EMEA", avatarColor: "#a78bfa" },
  { id: "cu-07", name: "Lucas Bernard", company: "Atelier Lumière", email: "lucas@atelierlumiere.fr", phone: "+33 1 55 55 0184", status: "Active", sinceDaysAgo: 720, region: "EMEA", avatarColor: "#38bdf8" },
  { id: "cu-08", name: "Priya Sharma", company: "Meridian Software", email: "priya@meridian-soft.in", phone: "+91 22 5555 0137", status: "VIP", sinceDaysAgo: 690, region: "APAC", avatarColor: "#f472b6" },
  { id: "cu-09", name: "James Carter", company: "Bluepeak Logistics", email: "james@bluepeaklogistics.com", phone: "+1 (312) 555-0165", status: "Active", sinceDaysAgo: 560, region: "North America", avatarColor: "#4ade80" },
  { id: "cu-10", name: "Elena Petrova", company: "Nordic Furniture House", email: "elena@nordicfh.no", phone: "+47 22 55 0129", status: "Active", sinceDaysAgo: 470, region: "EMEA", avatarColor: "#f97316" },
  { id: "cu-11", name: "Wei Zhang", company: "Golden Arch Manufacturing", email: "wei@goldenarch.cn", phone: "+86 10 5555 0288", status: "Active", sinceDaysAgo: 410, region: "APAC", avatarColor: "#55a1ff" },
  { id: "cu-12", name: "Isabella Rossi", company: "Casa Milano Interiors", email: "isabella@casamilano.it", phone: "+39 02 5555 0192", status: "New", sinceDaysAgo: 55, region: "EMEA", avatarColor: "#35d3f2" },
  { id: "cu-13", name: "Ahmed Hassan", company: "Nile Commerce", email: "ahmed@nilecommerce.eg", phone: "+20 2 5555 0261", status: "Active", sinceDaysAgo: 380, region: "MENA", avatarColor: "#34d399" },
  { id: "cu-14", name: "Grace Kim", company: "Skyline Tech Labs", email: "grace@skyline-tech.kr", phone: "+82 2 555 0214", status: "Active", sinceDaysAgo: 320, region: "APAC", avatarColor: "#fb7185" },
  { id: "cu-15", name: "Thomas Meyer", company: "Alpine Rail GmbH", email: "thomas@alpinerail.de", phone: "+49 89 5555 0158", status: "At Risk", sinceDaysAgo: 540, region: "EMEA", avatarColor: "#a78bfa" },
  { id: "cu-16", name: "Chloé Dubois", company: "Maison Verre", email: "chloe@maisonverre.fr", phone: "+33 4 55 55 0113", status: "New", sinceDaysAgo: 30, region: "EMEA", avatarColor: "#f472b6" },
  { id: "cu-17", name: "Marco Silva", company: "Iberia Furnishing", email: "marco@iberiafurnishing.pt", phone: "+351 21 555 0144", status: "Active", sinceDaysAgo: 280, region: "EMEA", avatarColor: "#4ade80" },
  { id: "cu-18", name: "Yuki Sato", company: "Kansai Office Supply", email: "yuki@kansai-office.jp", phone: "+81 6 5555 0331", status: "VIP", sinceDaysAgo: 240, region: "APAC", avatarColor: "#38bdf8" },
];

export const customerNotes: CustomerNote[] = [
  { id: "n-01", customerId: "cu-01", authorId: "e-18", body: "Renewal call went well — expects the enterprise agreement by end of month.", daysAgo: 2 },
  { id: "n-02", customerId: "cu-01", authorId: "e-18", body: "Asked for priority support on the new branch rollout.", daysAgo: 9 },
  { id: "n-03", customerId: "cu-02", authorId: "e-18", body: "Interested in the 4K projector line for regional offices.", daysAgo: 4 },
  { id: "n-04", customerId: "cu-03", authorId: "e-05", body: "Negotiating volume discount on the standing desks order.", daysAgo: 1 },
  { id: "n-05", customerId: "cu-08", authorId: "e-05", body: "Signed off the partner agreement — onboarding in progress.", daysAgo: 6 },
  { id: "n-06", customerId: "cu-12", authorId: "e-18", body: "First quote sent this week; follow up with seating samples.", daysAgo: 3 },
  { id: "n-07", customerId: "cu-15", authorId: "e-05", body: "Payment overdue 2 weeks; finance escalated contact.", daysAgo: 5 },
  { id: "n-08", customerId: "cu-18", authorId: "e-18", body: "Placed repeat order for monitor arms — very positive.", daysAgo: 2 },
];

export function getCustomer(id: string): Customer {
  return customers.find((c) => c.id === id) ?? customers[0];
}

export function customerName(id: string): string {
  return getCustomer(id).name;
}

export function customerCompany(id: string): string {
  return getCustomer(id).company;
}