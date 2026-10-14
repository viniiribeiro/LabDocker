import { useState, type FormEvent } from "react";
import { ApiError } from "../api";
import { STATUS_LABELS, type Client, type ClientInput, type ClientStatus } from "../types";

interface Props {
  client: Client | null;
  onSubmit: (data: ClientInput) => Promise<void>;
  onCancel: () => void;
}

export default function ClientForm({ client, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? "lead");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        status,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{client ? "Editar cliente" : "Novo cliente"}</h2>
        {error && <div className="alert">{error}</div>}

        <label>
          Nome *
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoFocus />
        </label>
        <div className="row">
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Telefone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
        <div className="row">
          <label>
            Empresa
            <input value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}>
              {(Object.keys(STATUS_LABELS) as ClientStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Observações
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
