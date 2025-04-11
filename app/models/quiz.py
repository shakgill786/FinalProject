from .question import Question
from app.models.db import db, environment, SCHEMA, add_prefix_for_prod

class Quiz(db.Model):
    __tablename__ = "quizzes"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    grade_level = db.Column(db.String(20))  # e.g. "Grade 1", "Kindergarten"

    questions = db.relationship("Question", back_populates="quiz", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "grade_level": self.grade_level
        }
