import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf
from flask_migrate import Migrate

from .models import db  # ✅ DB init from models
from .api.quiz_routes import quiz_routes

# ✅ Create Flask app and serve React build
app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# ✅ Config
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'sqlite:///dev.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Init Extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)

# ✅ Register blueprints
app.register_blueprint(quiz_routes, url_prefix="/api/quizzes")

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
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    return app.send_static_file("index.html")

# ✅ Fallback 404 handler
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

