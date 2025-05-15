from app.models import db, User
from werkzeug.security import generate_password_hash

def seed_users():
    users_data = [
        {"username": "Shak", "email": "shak@example.com", "password": "password", "role": "instructor"},
        {"username": "Emma", "email": "emma@example.com", "password": "password", "role": "student"},
    ]

    for data in users_data:
        existing_user = User.query.filter_by(email=data["email"]).first()
        if not existing_user:
            user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=generate_password_hash(data["password"]),
                role=data["role"]
            )
            db.session.add(user)

    db.session.commit()

def undo_users():
    db.session.execute("DELETE FROM users")
    db.session.commit()