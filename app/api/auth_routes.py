from flask import Blueprint, request
from app.models import User, db
from app.forms import LoginForm, SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint('auth', __name__)


# ✅ Ensure session restoration only works if the user is logged in
@auth_routes.route('/')
@login_required
def authenticate():
    """
    Returns the current user if authenticated.
    """
    return current_user.to_dict()


@auth_routes.route('/login', methods=['POST'])
def login():
    print("🔐 Login route hit!")
    form = LoginForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')
    print("📩 Form data received:", request.get_json())

    if form.validate_on_submit():
        user = User.query.filter(User.email == form.data['email']).first()
        login_user(user)
        print("✅ Login success:", user.username)
        return user.to_dict()
    
    print("❌ Form validation failed:", form.errors)
    return form.errors, 401


@auth_routes.route('/logout')
def logout():
    """
    Logs a user out.
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user with role and logs them in.
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        role = request.json.get("role", "student").strip().lower()
        if role not in ["student", "instructor"]:
            role = "student"  # Fallback for safety

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


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails.
    """
    return {'errors': {'message': 'Unauthorized'}}, 401


@auth_routes.route("/debug", methods=["GET"])
def debug():
    return {
        "current_user": current_user.to_dict() if current_user.is_authenticated else None,
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
    }