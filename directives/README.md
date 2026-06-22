# Directives (Livello 1)

Questa directory contiene le **SOP (Standard Operating Procedures)** scritte in Markdown.

## Scopo

Ogni direttiva definisce:
- **Obiettivo**: cosa deve essere fatto
- **Input**: dati o risorse necessarie
- **Tool/Script**: quali script in `execution/` usare
- **Output**: risultato atteso
- **Casi limite**: errori noti, limiti API, workaround

## Regole

- Le direttive sono **documenti vivi**: aggiornale quando scopri vincoli, approcci migliori o errori comuni
- Non creare o sovrascrivere direttive senza chiedere all'utente
- Scrivi in linguaggio naturale, come istruzioni per un dipendente di medio livello

## Formato consigliato

```markdown
# Nome Direttiva

## Obiettivo
Cosa deve essere raggiunto.

## Input
- Dato 1
- Dato 2

## Procedura
1. Step 1 → usa `execution/nome_script.py`
2. Step 2 → ...

## Output
Descrizione dell'output atteso.

## Casi Limite / Note
- Limite API: max 100 richieste/minuto
- Se errore X → prova Y
```
