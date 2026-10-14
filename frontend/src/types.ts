export type ClientStatus = "lead" | "prospect" | "customer" | "inactive";

export const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: "Lead",
  prospect: "Prospect",
  customer: "Cliente",
  inactive: "Inativo",
};

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">;

export interface Stats {
  total: number;
  lead: number;
  prospect: number;
  customer: number;
  inactive: number;
}
