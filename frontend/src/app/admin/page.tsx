"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Use relative path for API calls so they go through the Next.js rewrite proxy
const API_URL = "";

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

  const router = useRouter();
  const [selectedVisitors, setSelectedVisitors] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  const fetchData = useCallback(async (searchQuery = "") => {
    try {
      setError(null);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      const headers = { "Authorization": `Bearer ${token}` };
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      
      const [visitorsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/visitors${params}`, { headers }),
        fetch(`${API_URL}/api/visitors/stats`, { headers }),
      ]);

      if (visitorsRes.status === 401 || statsRes.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

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
  }, [router]);

  const handleBulkDelete = async () => {
    if (selectedVisitors.size === 0) return;
    if (!window.confirm(`Sei sicuro di voler eliminare ${selectedVisitors.size} visitatori?`)) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/visitors/delete-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids: Array.from(selectedVisitors) })
      });
      
      if (!res.ok) throw new Error("Errore durante l'eliminazione");
      
      setSelectedVisitors(new Set());
      fetchData(search);
    } catch (err) {
      alert("Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admins`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setAdmins(await res.json());
      }
    } catch (err) { }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username: newAdminUser, password: newAdminPass })
      });
      if (res.ok) {
        setNewAdminUser("");
        setNewAdminPass("");
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.detail || "Errore creazione admin");
      }
    } catch (err) {}
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm("Eliminare questo admin?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admins/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdmins();
      } else {
        const error = await res.json();
        alert(error.detail || "Errore eliminazione admin");
      }
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setShowAdminModal(true); fetchAdmins(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px]"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
          >
            Gestione Admin
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px]"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--error)" }}
          >
            Logout
          </button>
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
            onClick={async () => {
              try {
                const token = localStorage.getItem("admin_token");
                const params = search ? `?search=${encodeURIComponent(search)}` : "";
                const res = await fetch(`${API_URL}/api/visitors/export${params}`, {
                  headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Errore export");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `visitatori_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch(e) { alert("Errore esportazione"); }
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
          {selectedVisitors.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all hover:translate-y-[-1px] cursor-pointer"
              style={{ background: "var(--error)", color: "white" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Elimina Selezionati ({selectedVisitors.size})
            </button>
          )}
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
                  <th>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVisitors(new Set(visitors.map(v => v.id)));
                        } else {
                          setSelectedVisitors(new Set());
                        }
                      }}
                      checked={visitors.length > 0 && selectedVisitors.size === visitors.length}
                    />
                  </th>
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
                      <input 
                        type="checkbox" 
                        checked={selectedVisitors.has(visitor.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedVisitors);
                          if (e.target.checked) newSet.add(visitor.id);
                          else newSet.delete(visitor.id);
                          setSelectedVisitors(newSet);
                        }}
                      />
                    </td>
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

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-card w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gestione Amministratori</h2>
              <button onClick={() => setShowAdminModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mb-8 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs mb-1">Nuovo Username</label>
                <input type="text" value={newAdminUser} onChange={(e)=>setNewAdminUser(e.target.value)} required className="input-field py-2" />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Nuova Password</label>
                <input type="password" value={newAdminPass} onChange={(e)=>setNewAdminPass(e.target.value)} required minLength={5} className="input-field py-2" />
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-green-500/20 text-green-500 hover:bg-green-500/30 font-medium">
                Crea
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-700/50 bg-black/20">
                  <div>
                    <p className="font-medium">{admin.username}</p>
                    <p className="text-xs text-gray-500">Creato: {formatDate(admin.created_at)}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    title="Elimina"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
