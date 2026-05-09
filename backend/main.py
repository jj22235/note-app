from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from auth import create_access_token, get_current_user, get_password_hash, verify_password
from database import engine, ensure_schema, get_db

models.Base.metadata.create_all(bind=engine)
ensure_schema(engine)

app = FastAPI(title="个人笔记本")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="用户名已被注册")
    db_user = models.User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token)


@app.get("/api/me", response_model=schemas.UserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get("/api/notes", response_model=List[schemas.NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Note)
        .filter(models.Note.user_id == current_user.id)
        .order_by(models.Note.created_at.desc())
        .all()
    )


@app.get("/api/notes/{note_id}", response_model=schemas.NoteResponse)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return note


@app.post("/api/notes", response_model=schemas.NoteResponse)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_note = models.Note(
        user_id=current_user.id,
        **note.model_dump(),
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@app.put("/api/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(
    note_id: int,
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)
        .first()
    )
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    db_note.title = note.title
    db_note.content = note.content
    db.commit()
    db.refresh(db_note)
    return db_note


@app.delete("/api/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_note = (
        db.query(models.Note)
        .filter(models.Note.id == note_id, models.Note.user_id == current_user.id)
        .first()
    )
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    db.delete(db_note)
    db.commit()
    return {"message": "删除成功"}
