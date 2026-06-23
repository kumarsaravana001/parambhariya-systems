/** Seed for the browser demo driver. Mirrors apps/api/src/seed.ts. */
const uid = () => Math.random().toString(36).slice(2, 10);
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

export function seedData() {
  const strains = [
    { id: "s-pleurotus", name: "Pearl Oyster", scientific: "Pleurotus ostreatus", optimalTempMin: 22, optimalTempMax: 26, optimalRhMin: 85, optimalRhMax: 95, optimalCo2Max: 1000, cycleDays: 22, colonizationDays: 14, fruitingDays: 8, yieldKg: 12.4, supplier: "Parambhariya spawn lab", notes: "" },
    { id: "s-lentinula", name: "Shiitake", scientific: "Lentinula edodes", optimalTempMin: 16, optimalTempMax: 20, optimalRhMin: 80, optimalRhMax: 90, optimalCo2Max: 1000, cycleDays: 90, colonizationDays: 60, fruitingDays: 30, yieldKg: 8.1, supplier: "Parambhariya spawn lab", notes: "" },
    { id: "s-ganoderma", name: "Reishi", scientific: "Ganoderma lucidum", optimalTempMin: 24, optimalTempMax: 28, optimalRhMin: 85, optimalRhMax: 92, optimalCo2Max: 900, cycleDays: 75, colonizationDays: 45, fruitingDays: 30, yieldKg: 3.7, supplier: "Mushroom Research Centre", notes: "Medicinal" },
    { id: "s-hericium", name: "Lion's Mane", scientific: "Hericium erinaceus", optimalTempMin: 18, optimalTempMax: 24, optimalRhMin: 85, optimalRhMax: 95, optimalCo2Max: 800, cycleDays: 50, colonizationDays: 28, fruitingDays: 22, yieldKg: 5.2, supplier: "Parambhariya spawn lab", notes: "" },
  ];
  const farms = [
    { id: "f-anaimalai", name: "Anaimalai Block A", location: "Anaimalai, Tamil Nadu", areaSqM: 1200, bagCapacity: 1500, manager: "Saravanakumar", phone: "+91 90000 00001", establishedOn: "2024-06-01" },
    { id: "f-pollachi", name: "Pollachi Site", location: "Pollachi, Tamil Nadu", areaSqM: 600, bagCapacity: 700, manager: "Venkatesh", phone: "+91 90000 00002", establishedOn: "2025-01-15" },
  ];
  const rooms = [
    { id: "r-a1", farmId: "f-anaimalai", name: "Room A-1", purpose: "Colonization", sizeSqM: 220, bagCapacity: 600, rackCount: 12, notes: "Dark, low airflow" },
    { id: "r-a2", farmId: "f-anaimalai", name: "Room A-2", purpose: "Fruiting", sizeSqM: 180, bagCapacity: 400, rackCount: 8, notes: "Misting + LED" },
    { id: "r-a3", farmId: "f-anaimalai", name: "Room A-3", purpose: "Pinning", sizeSqM: 120, bagCapacity: 300, rackCount: 6, notes: "" },
    { id: "r-p1", farmId: "f-pollachi", name: "Room P-1", purpose: "Colonization", sizeSqM: 150, bagCapacity: 400, rackCount: 8, notes: "" },
    { id: "r-p2", farmId: "f-pollachi", name: "Room P-2", purpose: "Fruiting", sizeSqM: 110, bagCapacity: 300, rackCount: 6, notes: "" },
  ];
  const mkZone = (id: string, roomId: string, name: string, cap: number, dev: string, t: number, rh: number, co2: number) =>
    ({ id, roomId, name, bagCapacity: cap, deviceId: dev, setpointTempC: t, setpointRhPct: rh, setpointCo2Ppm: co2, tempC: null, rhPct: null, co2Ppm: null, lightLux: null, status: "OK", updatedAt: null });
  const zones = [
    mkZone("z-a1-c1", "r-a1", "Colonization Tunnel 1", 300, "EDGE-A1-01", 24, 88, 1400),
    mkZone("z-a2-f1", "r-a2", "Fruiting Chamber 1", 200, "EDGE-A2-01", 24, 90, 800),
    mkZone("z-a3-p1", "r-a3", "Pinning Bench 1", 150, "EDGE-A3-01", 20, 93, 650),
    mkZone("z-p1-c1", "r-p1", "Colonization Tunnel 1", 200, "EDGE-P1-01", 25, 86, 1500),
    mkZone("z-p2-f1", "r-p2", "Fruiting Chamber 1", 150, "EDGE-P2-01", 22, 89, 820),
  ];
  const bags = [
    { code: "AN-0142", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING", stageProgress: 0.6, weightG: 320, age: 24, substrate: "Supplemented sawdust", substrateWeightKg: 1.2, flushCount: 1 },
    { code: "AN-0143", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING", stageProgress: 0.55, weightG: null, age: 24, substrate: "Supplemented sawdust", substrateWeightKg: 1.2, flushCount: 0 },
    { code: "AN-0211", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "COLONIZING", stageProgress: 0.4, weightG: null, age: 9, substrate: "Hardwood sawdust", substrateWeightKg: 2.5, flushCount: 0 },
    { code: "AN-0240", strainId: "s-ganoderma", zoneId: "z-a3-p1", status: "PINNING", stageProgress: 0.7, weightG: null, age: 16, substrate: "Sawdust + bran", substrateWeightKg: 1.5, flushCount: 0 },
    { code: "AN-0099", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "HARVESTED", stageProgress: 1, weightG: 410, age: 33, substrate: "Paddy straw", substrateWeightKg: 1.0, flushCount: 3 },
    { code: "AN-0301", strainId: "s-hericium", zoneId: "z-a3-p1", status: "CREATED", stageProgress: 0.1, weightG: null, age: 1, substrate: "Supplemented sawdust", substrateWeightKg: 1.4, flushCount: 0 },
    { code: "AN-0210", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "CONTAMINATED", stageProgress: 0, weightG: null, age: 11, substrate: "Hardwood sawdust", substrateWeightKg: 2.5, flushCount: 0 },
    { code: "PO-0501", strainId: "s-pleurotus", zoneId: "z-p2-f1", status: "FRUITING", stageProgress: 0.45, weightG: null, age: 20, substrate: "Paddy straw", substrateWeightKg: 1.0, flushCount: 1 },
  ].map((b) => ({ id: uid(), code: b.code, strainId: b.strainId, zoneId: b.zoneId, status: b.status, stageProgress: b.stageProgress, weightG: b.weightG, substrate: b.substrate, substrateWeightKg: b.substrateWeightKg, inoculatedOn: iso(b.age).slice(0, 10), expectedHarvest: "", flushCount: b.flushCount, notes: "", createdAt: iso(b.age) }));

  const categories = [
    { id: "c1", parentId: null, name: "Fungi" },
    { id: "c1a", parentId: "c1", name: "Basidiomycetes" },
    { id: "c1b", parentId: "c1", name: "Ascomycetes" },
    { id: "c2", parentId: null, name: "Bacteria" },
  ];
  const storage = [
    { id: "b1", parentId: null, name: "Main Lab Building", type: "building", tempRange: "" },
    { id: "r1", parentId: "b1", name: "Culture Room", type: "room", tempRange: "" },
    { id: "f1", parentId: "r1", name: "Freezer A", type: "freezer", tempRange: "-20 °C" },
    { id: "uf1", parentId: "r1", name: "Ultra-Low Freezer", type: "ultra low freezer", tempRange: "-80 °C" },
    { id: "inc1", parentId: "r1", name: "Incubator 1", type: "incubator", tempRange: "25 °C" },
  ];
  const cultures = [
    { code: "CB-001", genus: "Pleurotus", species: "ostreatus", commonName: "Pearl Oyster MC", strainCode: "PO-2024-A", kingdom: "Fungi", status: "active", contaminated: false, gen: 3, stock: 12, storageId: "f1", categoryId: "c1a", intervalDays: 15, age: 24 },
    { code: "CB-002", genus: "Lentinula", species: "edodes", commonName: "Shiitake Master", strainCode: "LE-2023-B", kingdom: "Fungi", status: "active", contaminated: false, gen: 5, stock: 8, storageId: "f1", categoryId: "c1a", intervalDays: 30, age: 40 },
    { code: "CB-005", genus: "Trichoderma", species: "harzianum", commonName: "Contaminant isolate", strainCode: "TH-X", kingdom: "Fungi", status: "quarantine", contaminated: true, gen: 1, stock: 1, storageId: "inc1", categoryId: "c1b", intervalDays: 7, age: 11 },
  ].map((c) => ({ id: uid(), nextTransfer: null, createdAt: iso(c.age), ...c }));
  const customFields = [
    { id: uid(), label: "Collection Site", type: "Text", required: false },
    { id: uid(), label: "Substrate", type: "Dropdown", required: true },
  ];

  return {
    strains, farms, rooms, zones, bags,
    cultures, storage, categories, "custom-fields": customFields,
    readings: [], alerts: [], audit: [],
  };
}
