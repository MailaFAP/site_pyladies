import sqlite3
import tempfile
import unittest
from pathlib import Path

from backend.pyladies_api import create_app


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(temporary_directory.cleanup)
        database_path = Path(temporary_directory.name) / "test.sqlite3"
        app = create_app(
            {
                "TESTING": True,
                "DATABASE": database_path,
                "SECRET_KEY": "test-secret",
                "ADMIN_PASSWORD": "test-password",
            }
        )
        self.client = app.test_client()

    def test_public_collections_return_seed_data(self):
        for resource in ("events", "members", "forms"):
            with self.subTest(resource=resource):
                response = self.client.get(f"/api/{resource}")
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.json["data"])

    def test_admin_mutations_require_authentication(self):
        response = self.client.post(
            "/api/events",
            json={"tipo": "Mini Cursos", "data": "1 de jan", "horario": "10:00", "local": "Online", "palestrante": "", "foto_palestrante": "", "titulo": "Teste"},
        )
        self.assertEqual(response.status_code, 401)

    def test_admin_can_create_update_and_delete_event(self):
        login = self.client.post(
            "/api/login",
            json={"username": "admin", "password": "test-password"},
        )
        self.assertEqual(login.status_code, 200)

        payload = {"tipo": "Mini Cursos", "data": "1 de jan", "horario": "10:00", "local": "Online", "palestrante": "", "foto_palestrante": "", "titulo": "Evento de teste"}
        created = self.client.post("/api/events", json=payload)
        self.assertEqual(created.status_code, 200)
        event_id = created.json["data"]["id"]

        payload["titulo"] = "Evento atualizado"
        updated = self.client.put(f"/api/events/{event_id}", json=payload)
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json["data"]["titulo"], "Evento atualizado")
        self.assertEqual(updated.json["data"]["local"], "Online")

        deleted = self.client.delete(f"/api/events/{event_id}")
        self.assertEqual(deleted.status_code, 200)

    def test_event_requires_location(self):
        self.client.post("/api/login", json={"username": "admin", "password": "test-password"})
        response = self.client.post(
            "/api/events",
            json={"tipo": "Mini Cursos", "data": "1 de jan", "horario": "10:00", "titulo": "Sem local"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json["message"], "Preencha todos os campos obrigatórios.")

    def test_member_can_be_created_without_role(self):
        self.client.post("/api/login", json={"username": "admin", "password": "test-password"})
        response = self.client.post(
            "/api/members",
            json={"nome": "Ada Lovelace", "foto": "https://example.com/ada.jpg"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["data"]["nome"], "Ada Lovelace")
        self.assertEqual(response.json["data"]["foto"], "https://example.com/ada.jpg")
        self.assertNotIn("papel", response.json["data"])

    def test_workshop_requires_speaker_name_and_photo(self):
        self.client.post("/api/login", json={"username": "admin", "password": "test-password"})
        response = self.client.post(
            "/api/events",
            json={"tipo": "Palestras & Workshops", "data": "1 de jan", "horario": "10:00", "local": "Auditório", "palestrante": "", "foto_palestrante": "", "titulo": "Workshop"},
        )
        self.assertEqual(response.status_code, 400)

        response = self.client.post(
            "/api/events",
            json={"tipo": "Palestras & Workshops", "data": "1 de jan", "horario": "10:00", "local": "Auditório", "palestrante": "Ada Lovelace", "foto_palestrante": "https://example.com/ada.jpg", "titulo": "Workshop"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["data"]["palestrante"], "Ada Lovelace")
        self.assertEqual(response.json["data"]["foto_palestrante"], "https://example.com/ada.jpg")

    def test_minicourse_can_be_created_without_speaker(self):
        self.client.post("/api/login", json={"username": "admin", "password": "test-password"})
        response = self.client.post(
            "/api/events",
            json={"tipo": "Mini Cursos", "data": "1 de jan", "horario": "10:00", "local": "Online", "palestrante": "", "foto_palestrante": "", "titulo": "Minicurso"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["data"]["palestrante"], "")

    def test_existing_database_is_migrated_without_losing_events(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            database_path = Path(temporary_directory) / "legacy.sqlite3"
            connection = sqlite3.connect(database_path)
            try:
                connection.execute(
                    "CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, data TEXT NOT NULL, horario TEXT NOT NULL, titulo TEXT NOT NULL)"
                )
                connection.execute(
                    "CREATE TABLE members (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, papel TEXT NOT NULL, foto TEXT NOT NULL)"
                )
                connection.execute(
                    "INSERT INTO events (tipo, data, horario, titulo) VALUES (?, ?, ?, ?)",
                    ("Mini Cursos", "1 de jan", "10:00", "Evento existente"),
                )
                connection.execute(
                    "INSERT INTO members (id, nome, papel, foto) VALUES (?, ?, ?, ?)",
                    (17, "Membra existente", "Função antiga", "https://example.com/member.jpg"),
                )
                connection.commit()
            finally:
                connection.close()

            create_app(
                {
                    "TESTING": True,
                    "DATABASE": database_path,
                    "SECRET_KEY": "test-secret",
                    "ADMIN_PASSWORD": "test-password",
                }
            )
            connection = sqlite3.connect(database_path)
            try:
                columns = {row[1] for row in connection.execute("PRAGMA table_info(events)")}
                event = connection.execute("SELECT titulo, local, palestrante, foto_palestrante FROM events").fetchone()
                member_columns = {row[1] for row in connection.execute("PRAGMA table_info(members)")}
                member = connection.execute("SELECT id, nome, foto FROM members").fetchone()
            finally:
                connection.close()

        self.assertIn("local", columns)
        self.assertIn("palestrante", columns)
        self.assertIn("foto_palestrante", columns)
        self.assertEqual(event, ("Evento existente", "", "", ""))
        self.assertNotIn("papel", member_columns)
        self.assertEqual(member, (17, "Membra existente", "https://example.com/member.jpg"))

    def test_form_url_must_use_http_or_https(self):
        self.client.post("/api/login", json={"username": "admin", "password": "test-password"})
        response = self.client.post(
            "/api/forms",
            json={"titulo": "Teste", "descricao": "Teste", "url": "javascript:alert(1)"},
        )
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
