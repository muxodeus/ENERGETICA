# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db import get_db
from models import User         # modelo SQLAlchemy
from auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

class UserIn(BaseModel):
    email: str
    password: str
    role: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    class Config: orm_mode = True

@router.post("/", response_model=UserOut)
def create_user(payload: UserIn, db: Session = Depends(get_db),
                current = Depends(get_current_user)):
    if current.role != "super_admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    user = User(email=payload.email,
                hashed_password=hash_pwd(payload.password),
                role=payload.role)
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db),
               current = Depends(get_current_user)):
    if current.role != "super_admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return db.query(User).all()
# …PUT, DELETE…
