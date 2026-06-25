"use client";

import { useState } from "react";

// Use relative path for API calls so they go through the Next.js rewrite proxy
const API_URL = "";

const EUROPEAN_COUNTRIES = [
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaigian",
  "Belgio", "Bielorussia", "Bosnia ed Erzegovina", "Bulgaria",
  "Cipro", "Città del Vaticano", "Croazia",
  "Danimarca",
  "Estonia",
  "Finlandia", "Francia",
  "Georgia", "Germania", "Grecia",
  "Irlanda", "Islanda", "Italia",
  "Kazakistan", "Kosovo",
  "Lettonia", "Liechtenstein", "Lituania", "Lussemburgo",
  "Macedonia del Nord", "Malta", "Moldavia", "Monaco", "Montenegro",
  "Norvegia",
  "Paesi Bassi", "Polonia", "Portogallo",
  "Regno Unito", "Repubblica Ceca", "Romania", "Russia",
  "San Marino", "Serbia", "Slovacchia", "Slovenia", "Spagna", "Svezia", "Svizzera",
  "Turchia",
  "Ucraina", "Ungheria",
];

interface FormData {
  nome: string;
  cognome: string;
  email: string;
  professione: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
}

interface FormErrors {
  nome?: string;
  cognome?: string;
  email?: string;
  professione?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  stato?: string;
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cognome: "",
    email: "",
    professione: "",
    indirizzo: "",
    cap: "",
    citta: "",
    provincia: "",
    stato: "Italia",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  // Validazione client-side
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Il nome è obbligatorio";
    }
    if (!formData.cognome.trim()) {
      newErrors.cognome = "Il cognome è obbligatorio";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Inserisci un'email valida";
    }
    if (!formData.professione.trim()) {
      newErrors.professione = "La professione è obbligatoria";
    }
    if (!formData.indirizzo.trim()) {
      newErrors.indirizzo = "L'indirizzo è obbligatorio";
    }
    if (!formData.cap.trim()) {
      newErrors.cap = "Il CAP è obbligatorio";
    }
    if (!formData.citta.trim()) {
      newErrors.citta = "La città è obbligatoria";
    }
    if (!formData.provincia.trim()) {
      newErrors.provincia = "La provincia è obbligatoria";
    }
    if (!formData.stato.trim()) {
      newErrors.stato = "Lo stato è obbligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Rimuovi errore al cambio
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Errore durante la registrazione");
      }

      setSubmittedName(formData.nome);
      setShowSuccess(true);

      // Reset form
      setFormData({ nome: "", cognome: "", email: "", professione: "", indirizzo: "", cap: "", citta: "", provincia: "", stato: "Italia" });

      // Nascondi successo dopo 4 secondi
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Errore di connessione al server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="glass-card success-card">
            <div className="success-icon-ring">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  animation: "check-draw 0.6s ease 0.3s both",
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Registrazione completata!
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Grazie <span className="font-medium" style={{ color: "var(--accent-start)" }}>{submittedName}</span>, la tua
              visita è stata registrata con successo.
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              boxShadow: "0 8px 32px var(--accent-glow)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Benvenuto</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Compila il modulo per registrare la tua visita
          </p>
        </div>

        {/* Form Card */}
        <div
          className="glass-card p-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <form
            onSubmit={handleSubmit}
            className="stagger-children"
            noValidate
          >
            {/* Nome */}
            <div className="mb-5">
              <label htmlFor="nome" className="input-label">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Inserisci il tuo nome"
                className={`input-field ${errors.nome ? "input-error" : ""}`}
                autoComplete="given-name"
              />
              {errors.nome && (
                <p className="error-text">{errors.nome}</p>
              )}
            </div>

            {/* Cognome */}
            <div className="mb-5">
              <label htmlFor="cognome" className="input-label">
                Cognome
              </label>
              <input
                id="cognome"
                name="cognome"
                type="text"
                value={formData.cognome}
                onChange={handleChange}
                placeholder="Inserisci il tuo cognome"
                className={`input-field ${errors.cognome ? "input-error" : ""}`}
                autoComplete="family-name"
              />
              {errors.cognome && (
                <p className="error-text">{errors.cognome}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nome@esempio.com"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            {/* Professione */}
            <div className="mb-5">
              <label htmlFor="professione" className="input-label">
                Professione
              </label>
              <input
                id="professione"
                name="professione"
                type="text"
                value={formData.professione}
                onChange={handleChange}
                placeholder="Es. Ingegnere, Designer, Studente..."
                className={`input-field ${errors.professione ? "input-error" : ""}`}
                autoComplete="organization-title"
              />
              {errors.professione && (
                <p className="error-text">{errors.professione}</p>
              )}
            </div>

            {/* Indirizzo */}
            <div className="mb-5">
              <label htmlFor="indirizzo" className="input-label">
                Indirizzo
              </label>
              <input
                id="indirizzo"
                name="indirizzo"
                type="text"
                value={formData.indirizzo}
                onChange={handleChange}
                placeholder="Via Roma 1"
                className={`input-field ${errors.indirizzo ? "input-error" : ""}`}
                autoComplete="street-address"
              />
              {errors.indirizzo && (
                <p className="error-text">{errors.indirizzo}</p>
              )}
            </div>

            {/* CAP + Città */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div>
                <label htmlFor="cap" className="input-label">
                  CAP
                </label>
                <input
                  id="cap"
                  name="cap"
                  type="text"
                  value={formData.cap}
                  onChange={handleChange}
                  placeholder="00100"
                  className={`input-field ${errors.cap ? "input-error" : ""}`}
                  autoComplete="postal-code"
                  maxLength={10}
                />
                {errors.cap && (
                  <p className="error-text">{errors.cap}</p>
                )}
              </div>
              <div className="col-span-2">
                <label htmlFor="citta" className="input-label">
                  Città
                </label>
                <input
                  id="citta"
                  name="citta"
                  type="text"
                  value={formData.citta}
                  onChange={handleChange}
                  placeholder="Roma"
                  className={`input-field ${errors.citta ? "input-error" : ""}`}
                  autoComplete="address-level2"
                />
                {errors.citta && (
                  <p className="error-text">{errors.citta}</p>
                )}
              </div>
            </div>

            {/* Provincia + Stato */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              <div>
                <label htmlFor="provincia" className="input-label">
                  Provincia
                </label>
                <input
                  id="provincia"
                  name="provincia"
                  type="text"
                  value={formData.provincia}
                  onChange={handleChange}
                  placeholder="RM"
                  className={`input-field ${errors.provincia ? "input-error" : ""}`}
                  autoComplete="address-level1"
                  maxLength={5}
                />
                {errors.provincia && (
                  <p className="error-text">{errors.provincia}</p>
                )}
              </div>
              <div>
                <label htmlFor="stato" className="input-label">
                  Stato
                </label>
                <select
                  id="stato"
                  name="stato"
                  value={formData.stato}
                  onChange={handleChange}
                  className={`input-field ${errors.stato ? "input-error" : ""}`}
                  autoComplete="country-name"
                >
                  {EUROPEAN_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.stato && (
                  <p className="error-text">{errors.stato}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Registrazione in corso...
                </span>
              ) : (
                "Registra visita"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p
          className="text-center mt-6 text-sm animate-fade-in-up"
          style={{ animationDelay: "0.3s", color: "var(--text-muted)" }}
        >
          Area riservata?{" "}
          <a
            href="/admin"
            className="font-medium hover:underline"
            style={{ color: "var(--accent-start)" }}
          >
            Dashboard Admin →
          </a>
        </p>
      </div>
    </main>
  );
}
