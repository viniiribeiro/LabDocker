import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ClientForm from "../components/ClientForm";
import { STATUS_LABELS, type Client, type ClientInput, type ClientStatus } from "../types";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setClients(await api.listClients(search, status));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function handleSave(data: ClientInput) {
    if (editing) await api.updateClient(editing.id, data);
    else await api.createClient(data);
    setEditing(null);
    setCreating(false);
    await load();
  }

  async function handleDelete(c: Client) {
    if (!confirm(`Excluir "${c.name}"?`)) return;
    try {
      await api.deleteClient(c.id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Clientes</h1>
        <button className="btn" onClick={() => setCreating(true)}>
          + Novo cliente
        </button>
      </header>

      <div className="filters">
        <input
          placeholder="Buscar por nome, e-mail ou empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as ClientStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="card table-wrap">
        {loading ? (
          <p className="muted pad">Carregando…</p>
        ) : clients.length === 0 ? (
          <p className="muted pad">Nenhum cliente encontrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Empresa</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.company ?? "—"}</td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.phone ?? "—"}</td>
                  <td>
                    <span className={`badge badge-${c.status}`}>{STATUS_LABELS[c.status]}</span>
                  </td>
                  <td className="actions">
                    <button className="btn btn-ghost" onClick={() => setEditing(c)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(c)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <ClientForm
          client={editing}
          onSubmit={handleSave}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </>
  );
}
