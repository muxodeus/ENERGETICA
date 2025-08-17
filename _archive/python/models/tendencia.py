# models/tendencia.py
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Tendencia(Base):
    __tablename__ = "tendencias_minuto"
    id              = Column(Integer, primary_key=True, index=True)
    medidor_id      = Column(Integer, ForeignKey("medidores.id"))
    timestamp       = Column(DateTime(timezone=True), index=True)
    voltaje_A       = Column(Float)
    corriente_A     = Column(Float)
    potencia_total  = Column(Float)
    energia_total   = Column(Float)

    medidor = relationship("Medidor", back_populates="tendencias")
