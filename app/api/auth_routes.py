# app/api/auth_routes.py

from flask import Blueprint, request, jsonify
from app.models import User, db
from app.forms import LoginForm, SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint('auth', __name__)


# ─── SESSION / RESTORE ───────────────────────────────────────────
@auth_routes.route('/')
@login_required
def authenticate():
    """
    Returns the current user if authenticated.
    """
    return current_user.to_dict()


# ─── LOGIN ────────────────────────────────────────────────────────
@auth_routes.route('/login', methods=['POST'])
def login():
    form = LoginForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')

    if form.validate_on_submit():
        user = User.query.filter(User.email == form.data['email']).first()
        login_user(user)
        return user.to_dict()

    return form.errors, 401


# ─── LOGOUT ───────────────────────────────────────────────────────
@auth_routes.route('/logout')
def logout():
    """
    Logs a user out.
    """
    logout_user()
    return {'message': 'User logged out'}


# ─── SIGN UP ──────────────────────────────────────────────────────
@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user with role and logs them in.
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')

    if form.validate_on_submit():
        role = request.json.get("role", "student").strip().lower()
        if role not in ["student", "instructor"]:
            role = "student"

        user = User(
            username=form.data['username'],
            email=form.data['email'],
            password=form.data['password'],
            role=role
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return user.to_dict()

    return form.errors, 401


# ─── CHANGE PASSWORD ──────────────────────────────────────────────
@auth_routes.route('/change-password', methods=['PUT'])
@login_required
def change_password():
    """
    PUT /api/auth/change-password
    JSON body: { old_password: str, new_password: str }
    """
    data = request.get_json() or {}
    old = data.get('old_password', '').strip()
    new = data.get('new_password', '').strip()

    if not old or not new:
        return {'errors': ['Both current and new password are required']}, 400

    if not current_user.check_password(old):
        return {'errors': ['Current password is incorrect']}, 400

    current_user.password = new
    db.session.commit()
    return {'message': 'Password updated successfully'}, 200


# ─── UNAUTHORIZED HANDLER ─────────────────────────────────────────
@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails.
    """
    return {'errors': {'message': 'Unauthorized'}}, 401


# ─── DEBUGGING ────────────────────────────────────────────────────
@auth_routes.route('/debug', methods=['GET'])
def debug():
    return {
        "current_user": current_user.to_dict() if current_user.is_authenticated else None,
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
    }