"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Credenziali non valide");
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Accesso Admin</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Inserisci le tue credenziali per accedere alla dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: "var(--error-glow)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            <p style={{ color: "var(--error)" }} className="text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Inserisci username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Inserisci password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all hover:translate-y-[-1px] disabled:opacity-70 disabled:hover:translate-y-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              color: "white",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)"
            }}
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
