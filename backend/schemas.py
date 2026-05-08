from pydantic import BaseModel
from datetime import datetime


# 创建笔记时，前端发送的数据格式
class NoteCreate(BaseModel):
    title: str
    content: str


# 返回给前端的数据格式（多了 id 和时间）
class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True