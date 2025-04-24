from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("quizzes.id")), nullable=False)
    score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="quiz_attempts")
    quiz = db.relationship("Quiz", back_populates="quiz_attempts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "score": self.score,
            "timestamp": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "quiz": self.quiz.to_dict()
        }
