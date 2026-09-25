import type { Company, Department, Employee, EntityType } from "@/types";
const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
type Map = { companies: Company; departments: Department; employees: Employee };
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
export const api = {
  list: <K extends EntityType>(e: K) => request<Map[K][]>(`/${e}`),
  get: <K extends EntityType>(e: K, id: number) =>
    request<Map[K]>(`/${e}/${id}`),
  create: <K extends EntityType>(e: K, data: Omit<Map[K], "id">) =>
    request<Map[K]>(`/${e}`, { method: "POST", body: JSON.stringify(data) }),
  update: <K extends EntityType>(e: K, id: number, data: Partial<Map[K]>) =>
    request<Map[K]>(`/${e}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (e: EntityType, id: number) =>
    request<void>(`/${e}/${id}`, { method: "DELETE" }),
};
