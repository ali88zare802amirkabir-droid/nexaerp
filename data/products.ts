import type { Product, ProductStatus } from "@/lib/types";

function deriveStatus(quantity: number, reorderLevel: number): ProductStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}

export { deriveStatus };

const rows: Array<
  Omit<Product, "status" | "id"> & { id: string }
> = [
  { id: "p-01", sku: "NTBK-14-XR", name: "NexBook 14 Pro XR", category: "Computers", quantity: 42, unit: "units", reorderLevel: 12, warehouse: "Main · A1", updatedDaysAgo: 1, price: 2199, cost: 1480 },
  { id: "p-02", sku: "NTBK-16-MAX", name: "NexBook 16 Max", category: "Computers", quantity: 18, unit: "units", reorderLevel: 10, warehouse: "Main · A1", updatedDaysAgo: 2, price: 2699, cost: 1820 },
  { id: "p-03", sku: "NTBK-AIR-13", name: "NexBook Air 13", category: "Computers", quantity: 0, unit: "units", reorderLevel: 8, warehouse: "West · C1", updatedDaysAgo: 4, price: 1499, cost: 990 },
  { id: "p-04", sku: "DTWR-SLIM", name: "NexTower Slim i7", category: "Computers", quantity: 25, unit: "units", reorderLevel: 8, warehouse: "Main · A1", updatedDaysAgo: 3, price: 1899, cost: 1275 },
  { id: "p-05", sku: "DTWR-PRO", name: "NexTower Pro Xeon", category: "Computers", quantity: 9, unit: "units", reorderLevel: 5, warehouse: "East · A3", updatedDaysAgo: 6, price: 3499, cost: 2440 },
  { id: "p-06", sku: "DNSP-27-4K", name: "NexView 27 4K Studio", category: "Displays", quantity: 36, unit: "units", reorderLevel: 10, warehouse: "Main · B2", updatedDaysAgo: 1, price: 649, cost: 415 },
  { id: "p-07", sku: "DNSP-34-ULT", name: "NexView 34 UltraWide", category: "Displays", quantity: 14, unit: "units", reorderLevel: 6, warehouse: "Main · B2", updatedDaysAgo: 2, price: 949, cost: 610 },
  { id: "p-08", sku: "DNSP-24-FHD", name: "NexView 24 FHD", category: "Displays", quantity: 71, unit: "units", reorderLevel: 20, warehouse: "Main · B2", updatedDaysAgo: 9, price: 299, cost: 178 },
  { id: "p-09", sku: "DNSP-32-4K", name: "NexView 32 4K HDR", category: "Displays", quantity: 5, unit: "units", reorderLevel: 6, warehouse: "West · C1", updatedDaysAgo: 12, price: 749, cost: 480 },
  { id: "p-10", sku: "PNTR-MX3", name: "NexMouse MX3 Wireless", category: "Peripherals", quantity: 240, unit: "units", reorderLevel: 60, warehouse: "Main · A1", updatedDaysAgo: 0, price: 89, cost: 38 },
  { id: "p-11", sku: "PNTR-MX2", name: "NexMouse MX2", category: "Peripherals", quantity: 18, unit: "units", reorderLevel: 40, warehouse: "East · A3", updatedDaysAgo: 7, price: 49, cost: 20 },
  { id: "p-12", sku: "KYBD-MEC", name: "NexKbd Mechanical RGB", category: "Peripherals", quantity: 96, unit: "units", reorderLevel: 30, warehouse: "Main · A1", updatedDaysAgo: 2, price: 129, cost: 62 },
  { id: "p-13", sku: "KYBD-TUNDER", name: "NexKbd Tunder Pro", category: "Peripherals", quantity: 22, unit: "units", reorderLevel: 15, warehouse: "West · C1", updatedDaysAgo: 4, price: 179, cost: 88 },
  { id: "p-14", sku: "HDSK-FOCUS", name: "NexPhone Focus Call Headset", category: "Peripherals", quantity: 58, unit: "units", reorderLevel: 25, warehouse: "North · B1", updatedDaysAgo: 1, price: 159, cost: 74 },
  { id: "p-15", sku: "CAMA-1080P", name: "NexCam HD 1080p Webcam", category: "Peripherals", quantity: 63, unit: "units", reorderLevel: 20, warehouse: "Main · B2", updatedDaysAgo: 3, price: 99, cost: 41 },
  { id: "p-16", sku: "NTSW-48P", name: "NexSwitch 48-Port PoE", category: "Networking", quantity: 7, unit: "units", reorderLevel: 4, warehouse: "East · A3", updatedDaysAgo: 5, price: 1899, cost: 1210 },
  { id: "p-17", sku: "NTPR-MESH", name: "NexMesh Wi-Fi 6E Router", category: "Networking", quantity: 34, unit: "units", reorderLevel: 12, warehouse: "Main · B2", updatedDaysAgo: 2, price: 299, cost: 165 },
  { id: "p-18", sku: "NTPR-ENT", name: "NexGate Enterprise Gateway", category: "Networking", quantity: 0, unit: "units", reorderLevel: 3, warehouse: "East · A3", updatedDaysAgo: 8, price: 1299, cost: 840 },
  { id: "p-19", sku: "NTAAL-NANO", name: "NexAntenna Nano 802.11ax", category: "Networking", quantity: 41, unit: "units", reorderLevel: 15, warehouse: "Main · B2", updatedDaysAgo: 0, price: 149, cost: 62 },
  { id: "p-20", sku: "STRG-SSD2", name: "NexDrive SSD 2TB NVMe", category: "Storage", quantity: 88, unit: "units", reorderLevel: 30, warehouse: "Main · A1", updatedDaysAgo: 1, price: 249, cost: 130 },
  { id: "p-21", sku: "STRG-SSD4", name: "NexDrive SSD 4TB NVMe", category: "Storage", quantity: 31, unit: "units", reorderLevel: 15, warehouse: "Main · A1", updatedDaysAgo: 3, price: 449, cost: 260 },
  { id: "p-22", sku: "STRG-ARR8", name: "NexStore RAID Array 8-Bay", category: "Storage", quantity: 4, unit: "units", reorderLevel: 2, warehouse: "East · A3", updatedDaysAgo: 6, price: 3299, cost: 2210 },
  { id: "p-23", sku: "STRG-BKP", name: "NexVault Backup Library 12TB", category: "Storage", quantity: 6, unit: "units", reorderLevel: 3, warehouse: "East · A3", updatedDaysAgo: 9, price: 1899, cost: 1240 },
  { id: "p-24", sku: "PRNT-LSR", name: "NexPrint LaserJet Mono", category: "Printing", quantity: 19, unit: "units", reorderLevel: 8, warehouse: "Main · B2", updatedDaysAgo: 4, price: 699, cost: 380 },
  { id: "p-25", sku: "PRNT-CLR", name: "NexPrint Color LaserJet", category: "Printing", quantity: 11, unit: "units", reorderLevel: 6, warehouse: "Main · B2", updatedDaysAgo: 2, price: 1099, cost: 640 },
  { id: "p-26", sku: "SCNR-FLAT", name: "NexScan Flatbed A4", category: "Printing", quantity: 14, unit: "units", reorderLevel: 5, warehouse: "North · B1", updatedDaysAgo: 11, price: 349, cost: 190 },
  { id: "p-27", sku: "TNRLSR-80", name: "Toner Cartridge CX80", category: "Printing", quantity: 120, unit: "units", reorderLevel: 40, warehouse: "North · B1", updatedDaysAgo: 1, price: 79, cost: 31 },
  { id: "p-28", sku: "TNRCLR-30", name: "Color Toner Kit KCMY", category: "Printing", quantity: 8, unit: "units", reorderLevel: 12, warehouse: "North · B1", updatedDaysAgo: 5, price: 149, cost: 64 },
  { id: "p-29", sku: "PRJT-4K", name: "NexProject 4K Laser", category: "Projectors", quantity: 9, unit: "units", reorderLevel: 4, warehouse: "West · C1", updatedDaysAgo: 7, price: 2199, cost: 1430 },
  { id: "p-30", sku: "PRJT-1080", name: "NexProject Full HD", category: "Projectors", quantity: 0, unit: "units", reorderLevel: 3, warehouse: "West · C1", updatedDaysAgo: 13, price: 899, cost: 540 },
  { id: "p-31", sku: "SCRN-MOTOR", name: "NexScreen 120 Motorized", category: "Projectors", quantity: 3, unit: "units", reorderLevel: 2, warehouse: "West · C1", updatedDaysAgo: 15, price: 1299, cost: 780 },
  { id: "p-32", sku: "FURN-DESK", name: "NexDesk Standing Electric", category: "Furniture", quantity: 52, unit: "units", reorderLevel: 15, warehouse: "North · B1", updatedDaysAgo: 6, price: 599, cost: 310 },
  { id: "p-33", sku: "FURN-CHR", name: "NexChair Ergonomic Mesh", category: "Furniture", quantity: 84, unit: "units", reorderLevel: 25, warehouse: "North · B1", updatedDaysAgo: 3, price: 449, cost: 210 },
  { id: "p-34", sku: "FURN-BTHR", name: "NexChair Executive Leather", category: "Furniture", quantity: 12, unit: "units", reorderLevel: 6, warehouse: "North · B1", updatedDaysAgo: 8, price: 899, cost: 470 },
  { id: "p-35", sku: "FURN-CAB", name: "NexLocker Mobile Cabinet", category: "Furniture", quantity: 29, unit: "units", reorderLevel: 8, warehouse: "North · B1", updatedDaysAgo: 10, price: 329, cost: 150 },
  { id: "p-36", sku: "SUPL-PPR-A4", name: "A4 Multipurpose Paper (500)", category: "Supplies", quantity: 640, unit: "packs", reorderLevel: 200, warehouse: "Main · B2", updatedDaysAgo: 2, price: 6, cost: 2.4 },
  { id: "p-37", sku: "SUPL-PPR-GRN", name: "A4 Recycled Paper (500)", category: "Supplies", quantity: 45, unit: "packs", reorderLevel: 60, warehouse: "Main · B2", updatedDaysAgo: 4, price: 7, cost: 3.1 },
  { id: "p-38", sku: "SUPL-PNAB", name: "NexPen Gel 0.5mm (Box)", category: "Supplies", quantity: 310, unit: "boxes", reorderLevel: 100, warehouse: "Main · B2", updatedDaysAgo: 1, price: 9, cost: 3.2 },
  { id: "p-39", sku: "SUPL-BNDR", name: "NexBinder Ring A4 (Box)", category: "Supplies", quantity: 26, unit: "boxes", reorderLevel: 20, warehouse: "Main · B2", updatedDaysAgo: 7, price: 19, cost: 8.4 },
  { id: "p-40", sku: "ACCL-DOCK", name: "NexDock USB-C Quad", category: "Accessories", quantity: 66, unit: "units", reorderLevel: 25, warehouse: "Main · A1", updatedDaysAgo: 0, price: 249, cost: 118 },
  { id: "p-41", sku: "ACCL-BATT", name: "NexPower 100W Bank", category: "Accessories", quantity: 23, unit: "units", reorderLevel: 15, warehouse: "West · C1", updatedDaysAgo: 3, price: 129, cost: 54 },
  { id: "p-42", sku: "ACCL-SLEV", name: "NexSleeve 14-16 Laptop", category: "Accessories", quantity: 0, unit: "units", reorderLevel: 10, warehouse: "West · C1", updatedDaysAgo: 9, price: 39, cost: 14 },
  { id: "p-43", sku: "ACCL-CAMM", name: "NexCam Mount Arm", category: "Accessories", quantity: 8, unit: "units", reorderLevel: 6, warehouse: "Main · B2", updatedDaysAgo: 5, price: 79, cost: 32 },
  { id: "p-44", sku: "ACCL-STND", name: "NexStand Aluminum Laptop", category: "Accessories", quantity: 94, unit: "units", reorderLevel: 35, warehouse: "Main · B2", updatedDaysAgo: 2, price: 59, cost: 22 },
];

export const products: Product[] = rows.map((r) => ({
  ...r,
  status: deriveStatus(r.quantity, r.reorderLevel),
}));