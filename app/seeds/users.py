from app.models import db, User

def seed_users():
    user1 = User(username="Shak", email="shak@example.com", password="password", role="instructor")
    user2 = User(username="Emma", email="emma@example.com", password="password", role="student")

    db.session.add_all([user1, user2])
    db.session.commit()

def undo_users():
    db.session.execute("DELETE FROM users")
    db.session.commit()
