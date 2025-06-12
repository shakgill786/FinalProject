import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf, CSRFProtect
from flask_migrate import Migrate
from flask_login import LoginManager

# ─── load environment variables from project root .env ───────────────────
# assumes this file lives in <project_root>/app/__init__.py
basedir = Path(__file__).resolve().parent
project_root = basedir.parent
load_dotenv(project_root / ".env")

# ─── App Setup ────────────────────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=str(basedir / "static"),
    static_url_path=""    # serve JS/CSS/etc at "/<asset>"
)

# ─── Configuration ────────────────────────────────────────────────────────
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///dev.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

# ─── Extensions ───────────────────────────────────────────────────────────
from .models import db, User
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)
csrf = CSRFProtect(app)

# ─── Login Manager ────────────────────────────────────────────────────────
login_manager = LoginManager()
login_manager.login_view = "auth.unauthorized"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# ─── Blueprints ──────────────────────────────────────────────────────────
from .seeds import seed_commands
from .api.auth_routes import auth_routes
from .api.quiz_routes import quiz_routes
from .api.classroom_routes import classroom_routes
from .api.user_routes import user_routes
from .api.feedback_routes import feedback_routes

app.register_blueprint(auth_routes,    url_prefix="/api/auth")
app.register_blueprint(quiz_routes,    url_prefix="/api/quizzes")
app.register_blueprint(classroom_routes, url_prefix="/api/classrooms")
app.register_blueprint(user_routes,    url_prefix="/api/users")
app.register_blueprint(feedback_routes, url_prefix="/api/feedback")

# make `flask seed all` available
app.cli.add_command(seed_commands)

# ─── CSRF Restore Route ─────────────────────────────────────────────────
@app.route("/api/csrf/restore")
def restore_csrf():
    resp = jsonify({"message": "CSRF cookie set"})
    resp.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=True,
        samesite="None",
        httponly=False,
    )
    return resp

# ─── React Frontend Fallback ──────────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # if they try to hit /api/*, let Flask handle it (404 or your routes)
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    file_path = (basedir / "static" / path).resolve()
    if path and file_path.is_file():
        # serve asset or nested html if you have any
        return send_from_directory(str(basedir / "static"), path)

    # otherwise serve index.html
    return send_from_directory(str(basedir / "static"), "index.html")
