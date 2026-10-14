import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { STATUS_LABELS, type ClientStatus, type Stats } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.stats().then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Olá, {user?.name.split(" ")[0]} 👋</h1>
        <Link to="/clients" className="btn">
          Ver clientes
        </Link>
      </header>
      {error && <div className="alert">{error}</div>}
      {stats && (
        <div className="stats">
          <div className="card stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total de contatos</span>
          </div>
          {(Object.keys(STATUS_LABELS) as ClientStatus[]).map((s) => (
            <div key={s} className="card stat">
              <span className="stat-value">{stats[s]}</span>
              <span className="stat-label">{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
