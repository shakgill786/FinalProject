import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf, CSRFProtect
from flask_migrate import Migrate
from flask_login import LoginManager

from .models import db, User
from .seeds import seed_commands
from .api.auth_routes import auth_routes
from .api.quiz_routes import quiz_routes
from .api.classroom_routes import classroom_routes
from .api.user_routes import user_routes
from .api.feedback_routes import feedback_routes

app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# ─── Configuration ─────────────────────────────────────────────────
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = "None"
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True for production

# ─── Extensions ────────────────────────────────────────────────────
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)
csrf = CSRFProtect(app)

# ─── Login Manager ─────────────────────────────────────────────────
login_manager = LoginManager()
login_manager.login_view = "auth.unauthorized"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# ─── Blueprints ────────────────────────────────────────────────────
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(quiz_routes, url_prefix="/api/quizzes")
app.register_blueprint(classroom_routes, url_prefix="/api/classrooms")
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(feedback_routes, url_prefix="/api/feedback")
app.cli.add_command(seed_commands)

# ─── CSRF Restore Route ────────────────────────────────────────────
@app.route("/api/csrf/restore")
def restore_csrf():
    response = jsonify({"message": "CSRF cookie set"})
    response.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=True,              # ✅ For production HTTPS
        samesite="None",          # ✅ Needed for cross-site cookie in prod
        httponly=False
    )
    return response

# ─── React Frontend Fallback ───────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# ─── 404 Error Handler ─────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404