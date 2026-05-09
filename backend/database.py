import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL（库名默认 note_app，可通过环境变量覆盖）
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "note_app")

_password = quote_plus(MYSQL_PASSWORD)
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema(engine) -> None:
    """
    SQLAlchemy create_all 不会给已存在的表加新列。
    若 notes 表是旧版（缺少 user_id），在 MySQL 上补列并回填，否则新建笔记会报 1054。
    """
    if engine.dialect.name != "mysql":
        return
    try:
        insp = inspect(engine)
    except Exception:
        return
    if "notes" not in insp.get_table_names():
        return
    col_names = {c["name"] for c in insp.get_columns("notes")}
    if "user_id" in col_names:
        return

    with engine.begin() as conn:
        n = conn.execute(text("SELECT COUNT(*) FROM notes")).scalar_one()
        if n == 0:
            conn.execute(text("ALTER TABLE notes ADD COLUMN user_id INT NOT NULL"))
        else:
            conn.execute(text("ALTER TABLE notes ADD COLUMN user_id INT NULL"))
            uid = conn.execute(text("SELECT id FROM users ORDER BY id ASC LIMIT 1")).scalar()
            if uid is None:
                conn.execute(text("DELETE FROM notes"))
            else:
                conn.execute(
                    text("UPDATE notes SET user_id = :uid WHERE user_id IS NULL"),
                    {"uid": uid},
                )
            conn.execute(text("ALTER TABLE notes MODIFY user_id INT NOT NULL"))

        try:
            conn.execute(text("CREATE INDEX ix_notes_user_id ON notes (user_id)"))
        except Exception:
            pass
        try:
            conn.execute(
                text(
                    "ALTER TABLE notes ADD CONSTRAINT fk_notes_user_id "
                    "FOREIGN KEY (user_id) REFERENCES users (id)"
                )
            )
        except Exception:
            pass
