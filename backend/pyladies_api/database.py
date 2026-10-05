import sqlite3
from pathlib import Path

from flask import current_app, g
from werkzeug.security import generate_password_hash

from .seed_data import SEED_EVENTS, SEED_FORMS, SEED_MEMBERS


def get_db():
    if "db" not in g:
        database_path = current_app.config["DATABASE"]
        if str(database_path) != ":memory:":
            Path(database_path).parent.mkdir(parents=True, exist_ok=True)
        g.db = sqlite3.connect(database_path)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            data TEXT NOT NULL,
            horario TEXT NOT NULL,
            local TEXT NOT NULL DEFAULT '',
            palestrante TEXT NOT NULL DEFAULT '',
            foto_palestrante TEXT NOT NULL DEFAULT '',
            titulo TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            foto TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            url TEXT NOT NULL
        );
        """
    )

    event_columns = {
        row["name"] for row in db.execute("PRAGMA table_info(events)").fetchall()
    }
    event_migrations = {
        "local": "ALTER TABLE events ADD COLUMN local TEXT NOT NULL DEFAULT ''",
        "palestrante": "ALTER TABLE events ADD COLUMN palestrante TEXT NOT NULL DEFAULT ''",
        "foto_palestrante": "ALTER TABLE events ADD COLUMN foto_palestrante TEXT NOT NULL DEFAULT ''",
    }
    for column, migration in event_migrations.items():
        if column not in event_columns:
            db.execute(migration)

    member_columns = {
        row["name"] for row in db.execute("PRAGMA table_info(members)").fetchall()
    }
    if "papel" in member_columns:
        db.execute("DROP TABLE IF EXISTS members_without_role")
        db.execute(
            "CREATE TABLE members_without_role ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "nome TEXT NOT NULL, "
            "foto TEXT NOT NULL)"
        )
        db.execute(
            "INSERT INTO members_without_role (id, nome, foto) "
            "SELECT id, nome, foto FROM members"
        )
        db.execute("DROP TABLE members")
        db.execute("ALTER TABLE members_without_role RENAME TO members")

    if db.execute("SELECT COUNT(*) FROM admins").fetchone()[0] == 0:
        db.execute(
            "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
            ("admin", generate_password_hash(current_app.config["ADMIN_PASSWORD"])),
        )
    if db.execute("SELECT COUNT(*) FROM events").fetchone()[0] == 0:
        db.executemany("INSERT INTO events (tipo, data, horario, titulo) VALUES (?, ?, ?, ?)", SEED_EVENTS)
    if db.execute("SELECT COUNT(*) FROM members").fetchone()[0] == 0:
        db.executemany("INSERT INTO members (nome, foto) VALUES (?, ?)", SEED_MEMBERS)
    if db.execute("SELECT COUNT(*) FROM forms").fetchone()[0] == 0:
        db.executemany("INSERT INTO forms (titulo, descricao, url) VALUES (?, ?, ?)", SEED_FORMS)
    db.commit()
