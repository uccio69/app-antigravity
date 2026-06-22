# Execution (Livello 3)

Questa directory contiene gli **script Python deterministici** che eseguono il lavoro effettivo.

## Scopo

Gli script in questa directory:
- Gestiscono chiamate API, elaborazione dati, operazioni su file, interazioni con database
- Sono **affidabili, testabili, veloci**
- Leggono configurazione da `.env` (variabili d'ambiente, token API)
- Sono ben commentati

## Regole

- **Controlla prima i tool esistenti**: prima di creare un nuovo script, verifica se ne esiste già uno adatto
- **Auto-correzione**: se uno script si rompe, correggilo, testalo, e aggiorna la direttiva correlata
- Ogni script deve essere **autonomo** e utilizzabile singolarmente
- Usa `python-dotenv` per caricare le variabili da `.env`

## Convenzioni di naming

- `nome_azione.py` — es: `scrape_single_site.py`, `send_email.py`, `generate_report.py`
- Nomi descrittivi in snake_case
