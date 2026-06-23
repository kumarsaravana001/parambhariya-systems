/**
 * CBM Lab Portal — mock data. Microbial culture tracking.
 * Rendered in the Parambhariya design system; see docs/CBM-LAB-PORTAL.md.
 */

export type CultureStatus = "active" | "inactive" | "archived" | "quarantine" | "extinct";
export type Kingdom = "Archaebacteria" | "Eubacteria" | "Protista" | "Fungi" | "Plantae" | "Animalia";
export type Role = "Admin" | "Technician" | "Viewer";

export interface Culture {
  id: string;            // CB-001
  genus: string;
  species: string;
  commonName: string;
  strainCode?: string;
  kingdom: Kingdom;
  status: CultureStatus;
  contaminated: boolean;
  gen: number;
  stock: number;
  storage?: string;      // location id label
  category?: string;
  nextTransfer?: string; // ISO date
  intervalDays: number;
}

export interface StorageNode {
  id: string;
  name: string;
  type: "building" | "room" | "incubator" | "refrigerator" | "freezer" | "ultra low freezer" | "rack" | "box" | "shelf" | "position";
  tempRange?: string;
  children?: StorageNode[];
}

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

export interface LabUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Inactive" | "Suspended";
  joined: string;
  you?: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  type: "Text" | "Number" | "Date" | "Dropdown" | "Long Text";
  required: boolean;
}

export interface AuditEntry {
  id: string;
  ts: string;
  user: string;
  table: "Cultures" | "Isolation" | "Revival" | "Transfers" | "Storage";
  action: "Created" | "Updated" | "Deleted";
  detail: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;   // ₹
  cultures: number | "Unlimited";
  users: number | "Custom";
  storage: string;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
}

export const CULTURE_STATUSES: CultureStatus[] = ["active", "inactive", "archived", "quarantine", "extinct"];
export const KINGDOMS: Kingdom[] = ["Archaebacteria", "Eubacteria", "Protista", "Fungi", "Plantae", "Animalia"];
export const CULTURE_FORMATS = ["Mother Culture", "Master Stock", "Working Stock", "Liquid Culture", "Agar Slant", "Spore Print"];

export const statusTone: Record<CultureStatus, "success" | "neutral" | "warn" | "danger"> = {
  active: "success",
  inactive: "neutral",
  archived: "neutral",
  quarantine: "warn",
  extinct: "danger",
};

export const cultures: Culture[] = [
  { id: "CB-001", genus: "Pleurotus", species: "ostreatus", commonName: "Pearl Oyster MC", strainCode: "PO-2024-A", kingdom: "Fungi", status: "active", contaminated: false, gen: 3, stock: 12, storage: "Freezer A · Rack 2 · Box 1", category: "Basidiomycetes", nextTransfer: "2026-06-28", intervalDays: 15 },
  { id: "CB-002", genus: "Lentinula", species: "edodes", commonName: "Shiitake Master", strainCode: "LE-2023-B", kingdom: "Fungi", status: "active", contaminated: false, gen: 5, stock: 8, storage: "Freezer A · Rack 2 · Box 2", category: "Basidiomycetes", nextTransfer: "2026-07-04", intervalDays: 30 },
  { id: "CB-003", genus: "Ganoderma", species: "lucidum", commonName: "Reishi", strainCode: "GL-2024-A", kingdom: "Fungi", status: "quarantine", contaminated: false, gen: 2, stock: 4, storage: "Incubator 1", category: "Basidiomycetes", nextTransfer: "2026-06-24", intervalDays: 15 },
  { id: "CB-004", genus: "Hericium", species: "erinaceus", commonName: "Lion's Mane", kingdom: "Fungi", status: "active", contaminated: false, gen: 1, stock: 6, storage: "Freezer A · Rack 1 · Box 3", category: "Basidiomycetes", nextTransfer: "2026-06-30", intervalDays: 20 },
  { id: "CB-005", genus: "Trichoderma", species: "harzianum", commonName: "Contaminant isolate", strainCode: "TH-X", kingdom: "Fungi", status: "quarantine", contaminated: true, gen: 1, stock: 1, storage: "Quarantine shelf", category: "Ascomycetes", intervalDays: 7 },
  { id: "CB-006", genus: "Bacillus", species: "subtilis", commonName: "Soil isolate", kingdom: "Eubacteria", status: "active", contaminated: false, gen: 4, stock: 10, storage: "Fridge · Rack 1", category: "Bacteria", nextTransfer: "2026-06-26", intervalDays: 14 },
  { id: "CB-007", genus: "Agaricus", species: "bisporus", commonName: "White Button LC", strainCode: "AB-2022", kingdom: "Fungi", status: "archived", contaminated: false, gen: 9, stock: 0, category: "Basidiomycetes", intervalDays: 30 },
  { id: "CB-008", genus: "Cordyceps", species: "militaris", commonName: "Cordyceps", kingdom: "Fungi", status: "extinct", contaminated: false, gen: 6, stock: 0, category: "Ascomycetes", intervalDays: 21 },
];

export const storageTree: StorageNode[] = [
  {
    id: "b1", name: "Main Lab Building", type: "building",
    children: [
      {
        id: "r1", name: "Culture Room", type: "room",
        children: [
          { id: "f1", name: "Freezer A", type: "freezer", tempRange: "−20 °C", children: [
            { id: "rk1", name: "Rack 1", type: "rack", children: [{ id: "bx1", name: "Box 1", type: "box" }, { id: "bx2", name: "Box 2", type: "box" }] },
            { id: "rk2", name: "Rack 2", type: "rack", children: [{ id: "bx3", name: "Box 1", type: "box" }] },
          ]},
          { id: "uf1", name: "Ultra-Low Freezer", type: "ultra low freezer", tempRange: "−80 °C", children: [
            { id: "rk3", name: "Rack 1", type: "rack" },
          ]},
          { id: "inc1", name: "Incubator 1", type: "incubator", tempRange: "25 °C" },
        ],
      },
      { id: "r2", name: "Cold Room", type: "room", children: [
        { id: "fr1", name: "Refrigerator", type: "refrigerator", tempRange: "4 °C" },
      ]},
    ],
  },
];

export const categoryTree: CategoryNode[] = [
  { id: "c1", name: "Fungi", children: [
    { id: "c1a", name: "Basidiomycetes", children: [
      { id: "c1a1", name: "Gilled Mushrooms" },
      { id: "c1a2", name: "Polypores" },
    ]},
    { id: "c1b", name: "Ascomycetes" },
  ]},
  { id: "c2", name: "Bacteria", children: [
    { id: "c2a", name: "Gram-positive" },
    { id: "c2b", name: "Gram-negative" },
  ]},
  { id: "c3", name: "Control strains" },
];

export const labUsers: LabUser[] = [
  { id: "u1", name: "Saravanakumar", email: "saravana@agripie.com", role: "Admin", status: "Active", joined: "2026-06-17", you: true },
  { id: "u2", name: "Venkatesh", email: "venkatesh@agripie.com", role: "Technician", status: "Active", joined: "2026-06-18" },
  { id: "u3", name: "Dr. Sree Gayathri", email: "gayathri@agripie.com", role: "Technician", status: "Active", joined: "2026-06-18" },
  { id: "u4", name: "CA Vishnu Manoj", email: "vishnu@agripie.com", role: "Viewer", status: "Inactive", joined: "2026-06-19" },
];

export const roleTone: Record<Role, "info" | "neutral"> = { Admin: "info", Technician: "neutral", Viewer: "neutral" };

export const customFields: CustomField[] = [
  { id: "cf1", label: "Collection Site", type: "Text", required: false },
  { id: "cf2", label: "Substrate", type: "Dropdown", required: true },
  { id: "cf3", label: "pH", type: "Number", required: false },
];

export const auditLog: AuditEntry[] = [
  { id: "a1", ts: "2026-06-23 09:12", user: "Saravanakumar", table: "Cultures", action: "Created", detail: "CB-008 Cordyceps militaris" },
  { id: "a2", ts: "2026-06-23 08:40", user: "Venkatesh", table: "Transfers", action: "Created", detail: "CB-002 passage → Gen 5" },
  { id: "a3", ts: "2026-06-22 17:05", user: "Saravanakumar", table: "Storage", action: "Updated", detail: "Freezer A · added Rack 2" },
  { id: "a4", ts: "2026-06-22 14:21", user: "Dr. Sree Gayathri", table: "Cultures", action: "Updated", detail: "CB-005 flagged contaminated" },
  { id: "a5", ts: "2026-06-21 11:00", user: "Saravanakumar", table: "Cultures", action: "Deleted", detail: "CB-000 test record" },
];
export const auditActionTone: Record<AuditEntry["action"], "success" | "warn" | "danger"> = {
  Created: "success", Updated: "warn", Deleted: "danger",
};

export const plans: Plan[] = [
  { id: "micro", name: "Micro", priceMonthly: 419, cultures: 25, users: 1, storage: "250 MB", features: ["QR labels", "Passage logging", "2FA", "Audit logs", "Email support"] },
  { id: "inoculum", name: "Inoculum", priceMonthly: 1249, cultures: 100, users: 1, storage: "1 GB", features: ["QR labels", "Passage logging", "2FA", "Audit logs", "Email support"], popular: true },
  { id: "primordia", name: "Primordia", priceMonthly: 3329, cultures: 500, users: 2, storage: "2 GB", features: ["Everything in Inoculum", "Custom fields", "Bulk import / export"] },
  { id: "stroma", name: "Stroma", priceMonthly: 7999, cultures: 2000, users: 10, storage: "5 GB", features: ["Everything in Primordia", "Dedicated support"] },
  { id: "enterprise", name: "Enterprise", priceMonthly: 0, cultures: "Unlimited", users: "Custom", storage: "Custom", features: ["Unlimited cultures", "Custom storage", "SLA", "Dedicated support"], enterprise: true },
];

/* aggregates */
export const cultureStats = () => ({
  total: cultures.length,
  active: cultures.filter((c) => c.status === "active").length,
  contaminated: cultures.filter((c) => c.contaminated).length,
  withStorage: cultures.filter((c) => !!c.storage).length,
});
const countNodes = <T extends { children?: T[] }>(nodes: T[]): number =>
  nodes.reduce((n, x) => n + 1 + (x.children ? countNodes(x.children) : 0), 0);
export const storageCount = () => countNodes(storageTree);
export const categoryCount = () => countNodes(categoryTree);
