"""
FastAPI backend per l'app di registrazione visitatori.
Entry point: uvicorn main:app --reload
"""

import csv
import io
from datetime import date, datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from database import Base, engine, get_db
from models import Visitor, AdminUser
from schemas import (VisitorCreate, VisitorResponse, VisitorStats, 
                     AdminCreate, AdminUpdate, AdminResponse, Token, BulkDeleteVisitors)
import auth

# Creazione tabelle al primo avvio
Base.metadata.create_all(bind=engine)

with Session(engine) as db:
    if db.query(AdminUser).count() == 0:
        default_admin = AdminUser(
            username="ADMIN",
            hashed_password=auth.get_password_hash("12345")
        )
        db.add(default_admin)
        db.commit()

# Inizializzazione app FastAPI
app = FastAPI(
    title="Visitor Registration API",
    description="API per la registrazione e gestione dei visitatori",
    version="1.0.0"
)

# Configurazione CORS per permettere al frontend Next.js di comunicare
import os

allowed_origins = [
    "http://localhost:3000",    # Next.js dev server
    "http://127.0.0.1:3000",
]
origins_env = os.environ.get("ALLOWED_ORIGINS")
if origins_env:
    allowed_origins.extend([origin.strip() for origin in origins_env.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Visitor Registration API is running"}


@app.post("/api/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not admin or not auth.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/admins", response_model=List[AdminResponse])
def get_admins(db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    return db.query(AdminUser).all()

@app.post("/api/admins", response_model=AdminResponse, status_code=201)
def create_admin(admin: AdminCreate, db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    if db.query(AdminUser).filter(AdminUser.username == admin.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    db_admin = AdminUser(
        username=admin.username,
        hashed_password=auth.get_password_hash(admin.password)
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@app.put("/api/admins/{admin_id}", response_model=AdminResponse)
def update_admin(admin_id: int, admin: AdminUpdate, db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    db_admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db_admin.hashed_password = auth.get_password_hash(admin.password)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@app.delete("/api/admins/{admin_id}", status_code=204)
def delete_admin(admin_id: int, db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    db_admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if db.query(AdminUser).count() <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the last admin")
    db.delete(db_admin)
    db.commit()


@app.post("/api/visitors", response_model=VisitorResponse, status_code=201)
def create_visitor(visitor: VisitorCreate, db: Session = Depends(get_db)):
    """
    Registra un nuovo visitatore.
    Valida i dati con Pydantic e li salva nel database.
    """
    # Crea l'oggetto ORM dal schema Pydantic
    db_visitor = Visitor(
        nome=visitor.nome.strip(),
        cognome=visitor.cognome.strip(),
        email=visitor.email.strip().lower(),
        professione=visitor.professione.strip(),
        indirizzo=visitor.indirizzo.strip(),
        cap=visitor.cap.strip(),
        citta=visitor.citta.strip(),
        provincia=visitor.provincia.strip().upper(),
        stato=visitor.stato.strip(),
    )
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor


@app.get("/api/visitors", response_model=List[VisitorResponse])
def get_visitors(
    search: Optional[str] = Query(None, description="Cerca per nome, cognome o email"),
    skip: int = Query(0, ge=0, description="Offset per paginazione"),
    limit: int = Query(100, ge=1, le=500, description="Numero massimo di risultati"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(auth.get_current_admin),
):
    """
    Restituisce la lista dei visitatori registrati.
    Supporta ricerca testuale e paginazione.
    """
    query = db.query(Visitor)

    # Filtro di ricerca testuale (case-insensitive)
    if search:
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            (Visitor.nome.ilike(search_filter)) |
            (Visitor.cognome.ilike(search_filter)) |
            (Visitor.email.ilike(search_filter)) |
            (Visitor.professione.ilike(search_filter)) |
            (Visitor.citta.ilike(search_filter))
        )

    # Ordinamento per data di registrazione (più recenti prima)
    query = query.order_by(Visitor.created_at.desc())

    return query.offset(skip).limit(limit).all()


@app.get("/api/visitors/stats", response_model=VisitorStats)
def get_visitor_stats(db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    """
    Restituisce statistiche aggregate sui visitatori.
    """
    total = db.query(sql_func.count(Visitor.id)).scalar() or 0

    # Visitatori registrati oggi
    today_start = datetime.combine(date.today(), datetime.min.time())
    today = db.query(sql_func.count(Visitor.id)).filter(
        Visitor.created_at >= today_start
    ).scalar() or 0

    return VisitorStats(total=total, today=today)


@app.get("/api/visitors/export")
def export_visitors_csv(
    search: Optional[str] = Query(None, description="Filtra per nome, cognome o email"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(auth.get_current_admin),
):
    """
    Esporta la lista dei visitatori in formato CSV.
    Supporta filtro di ricerca opzionale.
    """
    query = db.query(Visitor)

    if search:
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            (Visitor.nome.ilike(search_filter)) |
            (Visitor.cognome.ilike(search_filter)) |
            (Visitor.email.ilike(search_filter)) |
            (Visitor.professione.ilike(search_filter)) |
            (Visitor.citta.ilike(search_filter))
        )

    query = query.order_by(Visitor.created_at.desc())
    visitors = query.all()

    # Genera il CSV in memoria
    output = io.StringIO()
    # BOM per compatibilità Excel con caratteri italiani (UTF-8-BOM)
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')

    # Header
    writer.writerow(["ID", "Nome", "Cognome", "Email", "Professione", "Indirizzo", "CAP", "Città", "Provincia", "Stato", "Data Registrazione"])

    # Righe dati
    for v in visitors:
        created = v.created_at.strftime("%d/%m/%Y %H:%M") if v.created_at else ""
        writer.writerow([v.id, v.nome, v.cognome, v.email, v.professione, v.indirizzo, v.cap, v.citta, v.provincia, v.stato, created])

    output.seek(0)

    # Nome file con data corrente
    filename = f"visitatori_{date.today().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.post("/api/visitors/delete-bulk", status_code=204)
def bulk_delete_visitors(payload: BulkDeleteVisitors, db: Session = Depends(get_db), current_admin: AdminUser = Depends(auth.get_current_admin)):
    """
    Elimina multipli visitatori dal database in una sola volta.
    """
    db.query(Visitor).filter(Visitor.id.in_(payload.ids)).delete(synchronize_session=False)
    db.commit()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
