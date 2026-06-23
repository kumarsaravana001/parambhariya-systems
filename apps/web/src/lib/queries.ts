import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import * as React from "react";
import { getDriver, type Resource, type Summary, type LiveReading } from "./driver";
import type {
  Farm, Room, Zone, Bag, Strain, Reading, Alert, Culture, StorageLocation, Category, CustomField, AuditEntry,
} from "@parambhariya/types";

const driver = getDriver();
const stale = 10_000;

/* ── generic resource hooks ─────────────────────────────────── */
export function useList<T = any>(r: Resource) {
  return useQuery<T[]>({ queryKey: [r], queryFn: () => driver.list<T>(r), staleTime: stale });
}
export function useItem<T = any>(r: Resource, id: string | undefined) {
  return useQuery<T>({ queryKey: [r, id], queryFn: () => driver.get<T>(r, id!), enabled: !!id });
}
function invalidate(qc: QueryClient, r: Resource) {
  qc.invalidateQueries({ queryKey: [r] });
  qc.invalidateQueries({ queryKey: ["summary"] });
  qc.invalidateQueries({ queryKey: ["audit"] });
}
export function useCreate<T = any>(r: Resource) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: any) => driver.create<T>(r, body), onSuccess: () => invalidate(qc, r) });
}
export function useUpdate<T = any>(r: Resource) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => driver.update<T>(r, id, body), onSuccess: () => invalidate(qc, r) });
}
export function useRemove(r: Resource) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => driver.remove(r, id), onSuccess: () => invalidate(qc, r) });
}

/* ── typed convenience wrappers ─────────────────────────────── */
export const useFarms = () => useList<Farm>("farms");
export const useRooms = () => useList<Room>("rooms");
export const useZones = () => useList<Zone>("zones");
export const useBags = () => useList<Bag>("bags");
export const useStrains = () => useList<Strain>("strains");
export const useCultures = () => useList<Culture>("cultures");
export const useStorage = () => useList<StorageLocation>("storage");
export const useCategories = () => useList<Category>("categories");
export const useCustomFields = () => useList<CustomField>("custom-fields");

export const useFarm = (id?: string) => useItem<Farm>("farms", id);
export const useZone = (id?: string) => useItem<Zone>("zones", id);
export const useRoom = (id?: string) => useItem<Room>("rooms", id);
export const useBag = (id?: string) => useItem<Bag>("bags", id);

/* ── derived / special ──────────────────────────────────────── */
export function useSummary() {
  return useQuery<Summary>({ queryKey: ["summary"], queryFn: () => driver.summary(), staleTime: 5000, refetchInterval: 8000 });
}
export function useAlerts(open = false) {
  return useQuery<Alert[]>({ queryKey: ["alerts", open], queryFn: () => driver.alerts(open), refetchInterval: 8000 });
}
export function useAckAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => driver.ackAlert(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); qc.invalidateQueries({ queryKey: ["summary"] }); } });
}
export function useZoneReadings(zoneId: string | undefined, limit = 60) {
  return useQuery<Reading[]>({ queryKey: ["readings", zoneId, limit], queryFn: () => driver.readings(zoneId!, limit), enabled: !!zoneId, refetchInterval: 5000 });
}
export function useSetSetpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, body }: { zoneId: string; body: { setpointTempC?: number; setpointRhPct?: number; setpointCo2Ppm?: number } }) => driver.setSetpoint(zoneId, body),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["zones"] }); qc.invalidateQueries({ queryKey: ["zones", v.zoneId] }); },
  });
}
export function useAudit() {
  return useQuery<AuditEntry[]>({ queryKey: ["audit"], queryFn: () => driver.audit(), refetchInterval: 10000 });
}

export const driverMode = driver.mode;

/* ── live readings: subscribe once, patch the query cache ───── */
export function useLiveReadings(onReading?: (r: LiveReading) => void) {
  const qc = useQueryClient();
  const cb = React.useRef(onReading);
  cb.current = onReading;
  React.useEffect(() => {
    const unsub = driver.subscribe((r) => {
      // patch the zone in the cached list so list views update live
      qc.setQueryData<Zone[]>(["zones"], (prev) =>
        prev?.map((z) => (z.id === r.zoneId ? { ...z, tempC: r.tempC, rhPct: r.rhPct, co2Ppm: r.co2Ppm, lightLux: r.lightLux, status: r.status, updatedAt: r.ts } : z)),
      );
      qc.setQueryData<Zone>(["zones", r.zoneId], (prev) =>
        prev ? { ...prev, tempC: r.tempC, rhPct: r.rhPct, co2Ppm: r.co2Ppm, lightLux: r.lightLux, status: r.status, updatedAt: r.ts } : prev,
      );
      cb.current?.(r);
    });
    return unsub;
  }, [qc]);
}
