import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf
from flask_migrate import Migrate
from flask_login import LoginManager

# ✅ Import models and seed CLI
from .models import db, User
from .seeds import seed_commands

# ✅ Import blueprints
from .api.auth_routes import auth_routes
from .api.quiz_routes import quiz_routes

# ✅ Create Flask app and serve React build
app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# ✅ Config
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Init extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)

# ✅ Login Manager Setup
login_manager = LoginManager()
login_manager.login_view = "auth.unauthorized"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# ✅ Register blueprints
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(quiz_routes, url_prefix="/api/quizzes")

# ✅ Register seed CLI
app.cli.add_command(seed_commands)

# ✅ CSRF Restore Route
@app.route("/api/csrf/restore")
def restore_csrf():
    response = jsonify({"message": "CSRF cookie set"})
    response.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=os.environ.get("FLASK_ENV") == "production",
        samesite="Strict" if os.environ.get("FLASK_ENV") == "production" else None,
        httponly=False
    )
    return response

# ✅ Serve React frontend build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

# ✅ Fallback 404 handler
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404
