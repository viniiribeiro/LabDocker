import type { Client, ClientInput, Stats, User } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "crm_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

function extractMessage(body: unknown): string {
  const detail = (body as { detail?: unknown })?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d: { msg?: string }) => d.msg ?? "Dado inválido").join("; ");
  }
  return "Erro inesperado";
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor");
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized?.();
    throw new ApiError(res.status, extractMessage(body));
  }
  return body as T;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<User>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }, false),

  login: (email: string, password: string) =>
    request<{ access_token: string }>(
      "/auth/login",
      { method: "POST", body: new URLSearchParams({ username: email, password }) },
      false,
    ),

  me: () => request<User>("/users/me"),

  stats: () => request<Stats>("/clients/stats"),

  listClients: (q: string, status: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const qs = params.toString();
    return request<Client[]>(`/clients${qs ? `?${qs}` : ""}`);
  },

  createClient: (data: ClientInput) => request<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),

  updateClient: (id: number, data: ClientInput) =>
    request<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteClient: (id: number) => request<void>(`/clients/${id}`, { method: "DELETE" }),
};
