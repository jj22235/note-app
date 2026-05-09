from pydantic import BaseModel, Field
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
