"""
Modelli ORM per il database dei visitatori.
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from database import Base


class Visitor(Base):
    """
    Modello per la tabella 'visitors'.
    Ogni riga rappresenta un visitatore registrato.
    """
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    cognome = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    professione = Column(String(150), nullable=False)
    indirizzo = Column(String(255), nullable=False)
    cap = Column(String(10), nullable=False)
    citta = Column(String(100), nullable=False)
    provincia = Column(String(5), nullable=False)
    stato = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Visitor(id={self.id}, nome='{self.nome}', cognome='{self.cognome}')>"
