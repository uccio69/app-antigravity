# Registrazione Visitatori

## Obiettivo
Gestire la registrazione anagrafica dei visitatori tramite un'app web con form self-service e dashboard admin.

## Architettura
- **Frontend**: Next.js 15 + React + Tailwind CSS (`frontend/`)
- **Backend**: FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Database**: SQLite locale (`backend/visitors.db`, auto-creato al primo avvio)

## Procedura di Avvio

### Backend (porta 8000)
```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Frontend (porta 3000)
```bash
cd frontend
npm run dev
```

### URL
- **Form visitatore**: http://localhost:3000
- **Dashboard admin**: http://localhost:3000/admin
- **API docs (Swagger)**: http://localhost:8000/docs

## Endpoint API

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/visitors` | Registra un nuovo visitatore |
| GET | `/api/visitors` | Lista visitatori (con `?search=` per ricerca) |
| GET | `/api/visitors/stats` | Statistiche aggregate |
| GET | `/api/visitors/export` | Export CSV dei visitatori (con `?search=` opzionale) |

## Dati Raccolti
- Nome (stringa, obbligatorio)
- Cognome (stringa, obbligatorio)
- Email (stringa, validata, obbligatorio)
- Professione (stringa, obbligatorio)
- Indirizzo (stringa, obbligatorio)
- CAP (stringa, max 10 caratteri, obbligatorio)
- Città (stringa, obbligatorio)
- Provincia (stringa, max 5 caratteri, sigla, obbligatorio)
- Stato (stringa, obbligatorio, default "Italia")
- Data registrazione (timestamp, automatico)

## Casi Limite / Note
- Il database SQLite viene creato automaticamente al primo avvio del backend
- Il file `visitors.db` è in `.gitignore` e non viene committato
- La validazione avviene sia lato client (JS) che lato server (Pydantic)
- CORS configurato solo per `localhost:3000`
- Per produzione: sostituire SQLite con PostgreSQL e configurare `DATABASE_URL` in `.env`
