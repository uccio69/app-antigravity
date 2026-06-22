"""
Database setup per l'app di registrazione visitatori.
Usa SQLAlchemy con SQLite come backend.
Il file DB viene creato automaticamente al primo avvio.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env (se esiste)
load_dotenv()

# Legge il database URL dalle variabili d'ambiente se definito, altrimenti usa SQLite
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'visitors.db')}"

# Creazione engine SQLAlchemy
# check_same_thread=False è necessario SOLO per SQLite con FastAPI (multi-thread)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    # Se il database URL inizia con postgres://, SQLAlchemy 2.0 richiede postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(
        DATABASE_URL,
        echo=False
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class per i modelli ORM
Base = declarative_base()


def get_db():
    """
    Dependency FastAPI per ottenere una sessione DB.
    La sessione viene chiusa automaticamente dopo ogni request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
