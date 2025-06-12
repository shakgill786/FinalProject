from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    if environment == 'production' and SCHEMA:
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')

    # relationships
    classrooms = db.relationship('Classroom', back_populates='instructor', cascade='all, delete-orphan')
    enrolled_classrooms = db.relationship(
        'Classroom',
        secondary=add_prefix_for_prod('classroom_students'),
        back_populates='students'
    )
    quizzes = db.relationship('Quiz', back_populates='instructor', cascade='all, delete-orphan')
    quiz_attempts = db.relationship('QuizAttempt', back_populates='user', cascade='all, delete-orphan')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, raw):
        self.hashed_password = generate_password_hash(raw)

    def check_password(self, raw):
        return check_password_hash(self.hashed_password, raw)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role
        }
