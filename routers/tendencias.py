from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db  # tu función para obtener el Session
from app.auth import get_current_user  # autenticación
from typing import List

router = APIRouter(prefix="/api/tendencias", tags=["Tendencias"])

@router.get("/hora")
def get_tendencias_por_hora(
    medidor_id: int,
    desde: datetime = Query(..., description="Fecha inicial ISO8601"),
    hasta: datetime = Query(..., description="Fecha final ISO8601"),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Verifica que el medidor le pertenezca al usuario
    res = db.execute(
        "SELECT 1 FROM medidores WHERE id = :id AND usuario_id = :uid",
        {"id": medidor_id, "uid": user.id}
    ).fetchone()
    if not res:
        raise HTTPException(403, detail="No autorizado")

    # Consulta la vista materializada
    sql = """
        SELECT hora, voltaje_h, corriente_h, potencia_h, energia_h
        FROM tendencias_por_hora
        WHERE medidor_id = :mid
        AND hora BETWEEN :desde AND :hasta
        ORDER BY hora
    """
    result = db.execute(sql, {"mid": medidor_id, "desde": desde, "hasta": hasta}).fetchall()

    return [
        {
            "timestamp": row[0],
            "voltaje_A": row[1],
            "corriente_A": row[2],
            "potencia_total": row[3],
            "energia_total": row[4]
        }
        for row in result
    ]
