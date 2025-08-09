# models/medidor.py
from sqlalchemy.orm import relationship

class Medidor(Base):
    __tablename__ = "medidores"
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    tendencias = relationship("Tendencia", back_populates="medidor")
