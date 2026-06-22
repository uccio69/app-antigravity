"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Visitor {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  professione: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
}

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (searchQuery = "") => {
    try {
      setError(null);
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const [visitorsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/visitors${params}`),
        fetch(`${API_URL}/api/visitors/stats`),
      ]);

      if (!visitorsRes.ok || !statsRes.ok) {
        throw new Error("Errore nel caricamento dei dati");
      }

      const [visitorsData, statsData] = await Promise.all([
        visitorsRes.json(),
        statsRes.json(),
      ]);

      setVisitors(visitorsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di connessione");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Gestione visitatori registrati
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px]"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            color: "var(--text-secondary)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Torna al form
        </Link>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Totale visitatori */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Totale Visitatori
            </span>
          </div>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>

        {/* Oggi */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.15)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Registrati Oggi
            </span>
          </div>
          <p className="text-4xl font-bold" style={{ color: "var(--success)" }}>
            {stats.today}
          </p>
        </div>

        {/* Actions */}
        <div className="stat-card flex items-center justify-center gap-3">
          <button
            onClick={() => fetchData(search)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px] cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              color: "white",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
            Aggiorna
          </button>
          <button
            onClick={() => {
              const params = search ? `?search=${encodeURIComponent(search)}` : "";
              window.open(`${API_URL}/api/visitors/export${params}`, "_blank");
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px] cursor-pointer"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
            id="export-csv-button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Esporta CSV
          </button>
        </div>
      </div>

      {/* Search + Table */}
      <div
        className="glass-card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        {/* Search Bar */}
        <div className="p-5 border-b" style={{ borderColor: "var(--glass-border)" }}>
          <div className="search-bar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome, cognome, email, professione o città..."
              className="input-field"
              id="search-visitors"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8"
              style={{ color: "var(--accent-start)" }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--error-glow)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--error)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p style={{ color: "var(--error)" }} className="font-medium mb-1">
              Errore di connessione
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {error}. Assicurati che il backend sia avviato.
            </p>
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124, 58, 237, 0.1)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-start)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              {search ? "Nessun risultato" : "Nessun visitatore registrato"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {search
                ? "Prova con un'altra ricerca"
                : "I visitatori appariranno qui dopo la registrazione"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Email</th>
                  <th>Professione</th>
                  <th>Indirizzo</th>
                  <th>Città</th>
                  <th>Prov.</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor, idx) => (
                  <tr key={visitor.id}>
                    <td>
                      <span className="badge badge-purple">{visitor.id}</span>
                    </td>
                    <td className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {visitor.nome}
                    </td>
                    <td className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {visitor.cognome}
                    </td>
                    <td>{visitor.email}</td>
                    <td>{visitor.professione}</td>
                    <td>
                      <span className="text-sm">{visitor.indirizzo}</span>
                      <br />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {visitor.cap} {visitor.citta}
                      </span>
                    </td>
                    <td>{visitor.citta}</td>
                    <td>
                      <span className="badge badge-purple">{visitor.provincia}</span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {formatDate(visitor.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && visitors.length > 0 && (
          <div
            className="px-5 py-3 border-t text-sm flex items-center justify-between"
            style={{
              borderColor: "var(--glass-border)",
              color: "var(--text-muted)",
            }}
          >
            <span>
              {visitors.length} visitator{visitors.length === 1 ? "e" : "i"}{" "}
              {search ? "trovati" : "totali"}
            </span>
            <span>Ultimo aggiornamento: {new Date().toLocaleTimeString("it-IT")}</span>
          </div>
        )}
      </div>
    </main>
  );
}
