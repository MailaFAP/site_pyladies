from flask import Flask
from flask_cors import CORS

from .config import Config
from .database import close_db, init_db
from .routes.auth import auth_bp
from .routes.content import content_bp


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    CORS(app, supports_credentials=True)
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(content_bp, url_prefix="/api")
    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db()

    return app
