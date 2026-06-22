# Guida al Deploy su Amazon Web Services (AWS)

Questa guida spiega passo-passo come pubblicare l'applicazione **app-antigravity** su AWS utilizzando lo stack raccomandato per garantire scalabilità, stabilità e sicurezza:
* **Frontend (Next.js)**: AWS Amplify
* **Backend (FastAPI)**: AWS App Runner (consigliato per container) oppure AWS Elastic Beanstalk (Python)
* **Database**: AWS RDS (PostgreSQL)

---

## Prerequisiti
1. Un account AWS attivo.
2. AWS CLI configurata sul proprio computer (opzionale, utile per automazioni).
3. Il codice sorgente dell'applicazione salvato in un repository Git (es. GitHub, GitLab, Bitbucket) per abilitare la CI/CD di AWS Amplify.

---

## 1. Configurazione del Database (AWS RDS PostgreSQL)

Poiché SQLite è un file system locale ed effimero in cloud (verrebbe resettato ad ogni riavvio o ridimensionamento dei server), utilizzeremo **AWS RDS PostgreSQL** come database persistente.

1. Accedi alla console AWS e cerca **RDS**.
2. Clicca su **Create database**.
3. Seleziona le seguenti opzioni:
   * **Engine options**: PostgreSQL
   * **Templates**: *Free tier* (per evitare costi durante i test) o *Production* a seconda delle esigenze.
   * **Settings**:
     * **DB instance identifier**: `antigravity-db`
     * **Master username**: `postgres` (o altro nome utente amministratore)
     * **Master password**: Scegli una password complessa (es. `tua_password_sicura`).
   * **Connectivity**:
     * Imposta **Public access** su **No** (il database sarà accessibile solo dal backend).
     * Assicurati che venga creato un Security Group associato (lo configureremo nel punto successivo).
4. Clicca su **Create database** (la creazione può richiedere 5-10 minuti).
5. Una volta completato, clicca sul database e copia l'**Endpoint** fornito (es. `antigravity-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`).
6. La tua stringa di connessione (`DATABASE_URL`) sarà:
   `postgresql://postgres:tua_password_sicura@antigravity-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres`

---

## 2. Deploy del Backend (FastAPI)

Puoi scegliere tra due servizi AWS per pubblicare le API FastAPI.

### Opzione A: AWS App Runner (Consigliata, Containerizzata)
App Runner è il servizio più semplice ed economico per far girare container FastAPI. Utilizza il `Dockerfile` presente nella cartella `/backend`.

1. Cerca **AWS App Runner** nella console AWS e clicca su **Create service**.
2. **Repository type**: Seleziona **Source code repository**.
3. **Connect to git provider**: Collega il tuo account GitHub e seleziona il repository.
4. **Deployment settings**: Scegli **Automatic** per ripubblicare l'app ad ogni push sul branch principale.
5. **Configure build**:
   * **Repository directory**: `/backend`
   * **Runtime**: Select `Python 3` (se configuri il codice direttamente) oppure **Dockerfile** (consigliato).
     * Se selezioni **Dockerfile**:
       * Non devi configurare build/run commands perché sono già specificati in `Dockerfile`.
       * **Port**: `8000` (la porta esposta dal container).
6. **Configure service**:
   * Sotto **Environment variables**, aggiungi le seguenti variabili:
     * `DATABASE_URL`: `postgresql://postgres:tua_password_sicura@antigravity-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres` (l'URI del tuo RDS creato nello step precedente).
     * `ALLOWED_ORIGINS`: `https://main.xxxxxxxx.amplifyapp.com` (inserisci l'URL finale del frontend AWS Amplify una volta creato, oppure usa `*` temporaneamente per i test).
7. Clicca su **Create & Deploy**.
8. Una volta completato il deploy, copia l'**URL del servizio** di App Runner (es. `https://xxxxxx.us-east-1.awsapprunner.com`). Sarà l'URL del tuo backend.

---

### Opzione B: AWS Elastic Beanstalk (Standard, Python Platform)
Se preferisci non usare container, puoi pubblicare direttamente il codice Python su Elastic Beanstalk.

1. Comprimi la cartella `backend` in un file `.zip` (assicurati che il file `Procfile` sia alla radice dello zip insieme a `main.py`).
2. Cerca **Elastic Beanstalk** nella console AWS e clicca su **Create application**.
3. Seleziona:
   * **Platform**: `Python`
   * **Platform branch**: `Python 3.10 running on 64bit Amazon Linux 2023`
   * **Application code**: `Upload your code` (seleziona il file `.zip` generato).
4. Clicca su **Configure more options** (Configura altre opzioni) per configurare il database e la rete.
5. Sotto la sezione **Software** (Environment properties / Variabili d'ambiente), aggiungi:
   * `DATABASE_URL`: `postgresql://postgres:tua_password_sicura@antigravity-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/postgres`
   * `ALLOWED_ORIGINS`: `*` o l'URL del tuo frontend.
6. Assicurati che l'istanza EC2 creata da Beanstalk abbia accesso di rete al tuo RDS PostgreSQL (controlla le regole di ingresso del Security Group del DB per consentire traffico dal Security Group dell'istanza EC2).
7. Clicca su **Create app** ed attendi il completamento del deploy. Copia l'URL dell'ambiente generato (es. `http://antigravity-env.eba-xxxxxx.us-east-1.elasticbeanstalk.com`).

---

## 3. Deploy del Frontend (AWS Amplify)

AWS Amplify compilerà ed eseguirà l'applicazione Next.js gestendo il Server-Side Rendering (SSR).

1. Cerca **AWS Amplify** nella console AWS.
2. Clicca su **New App** -> **Host web app**.
3. Seleziona il tuo Git provider (es. GitHub) e clicca su **Continue**.
4. Seleziona il repository del tuo progetto e il branch desiderato (es. `main`).
5. **App directory**: Inserisci `frontend` (importante, poiché il progetto è una monorepo e Next.js si trova in questa sottocartella).
6. **Build settings**:
   * AWS rileverà automaticamente la presenza di Next.js e compilerà i settaggi. Il file `frontend/amplify.yml` configurato guiderà il build.
7. **Environment variables**:
   * Aggiungi la variabile d'ambiente per connettere il frontend alle API del backend:
     * Key: `NEXT_PUBLIC_API_URL`
     * Value: `https://xxxxxx.us-east-1.awsapprunner.com` (l'URL pubblico del tuo backend App Runner o Elastic Beanstalk).
8. Clicca su **Save and Deploy**.
9. AWS Amplify scaricherà il codice, installerà le dipendenze, compilerà l'applicazione Next.js ed effettuerà il deploy globale su CloudFront CDN.
10. Una volta completato, copia l'URL dell'applicazione di Amplify (es. `https://main.xxxxxxxx.amplifyapp.com`) e ricordati di inserirlo nella variabile d'ambiente `ALLOWED_ORIGINS` del backend per abilitare correttamente il CORS.

---

## 4. Gestione delle Migrazioni del Database

FastAPI è configurato per creare automaticamente le tabelle nel database relazionale all'avvio dell'applicazione tramite la riga:
```python
Base.metadata.create_all(bind=engine)
```
Questo significa che al primo avvio su AWS (dopo aver connesso l'RDS), le tabelle necessarie per salvare i visitatori verranno create automaticamente all'interno del database PostgreSQL senza dover eseguire script SQL manuali.

---

## 5. Aggiornamento in tempo reale (CI/CD)

Entrambi i servizi (Amplify e App Runner/Elastic Beanstalk) supportano la Continuous Integration:
* Ogni volta che effettui un `git push` sul tuo branch principale, AWS rileverà la modifica.
* Il frontend Next.js verrà ricompilato automaticamente su Amplify.
* Le API verranno aggiornate automaticamente sul backend (se configurato con trigger automatico).
