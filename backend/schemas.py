"""
Schemi Pydantic per validazione e serializzazione dei dati.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class VisitorCreate(BaseModel):
    """Schema per la creazione di un nuovo visitatore (input dal form)."""
    nome: str = Field(..., min_length=1, max_length=100, description="Nome del visitatore")
    cognome: str = Field(..., min_length=1, max_length=100, description="Cognome del visitatore")
    email: EmailStr = Field(..., description="Email del visitatore")
    professione: str = Field(..., min_length=1, max_length=150, description="Professione del visitatore")
    indirizzo: str = Field(..., min_length=1, max_length=255, description="Indirizzo del visitatore")
    cap: str = Field(..., min_length=1, max_length=10, description="Codice Avviamento Postale")
    citta: str = Field(..., min_length=1, max_length=100, description="Città del visitatore")
    provincia: str = Field(..., min_length=1, max_length=5, description="Sigla provincia (es. MI, RM)")
    stato: str = Field(..., min_length=1, max_length=100, description="Stato / Paese")


class VisitorResponse(BaseModel):
    """Schema per la risposta con i dati del visitatore (output)."""
    id: int
    nome: str
    cognome: str
    email: str
    professione: str
    indirizzo: str
    cap: str
    citta: str
    provincia: str
    stato: str
    created_at: datetime

    model_config = {"from_attributes": True}


class VisitorStats(BaseModel):
    """Schema per le statistiche aggregate dei visitatori."""
    total: int
    today: int

