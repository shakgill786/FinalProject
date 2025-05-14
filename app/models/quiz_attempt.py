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
    points = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="completed")

    user = db.relationship("User", back_populates="quiz_attempts")
    quiz = db.relationship("Quiz", back_populates="quiz_attempts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "score": self.score,
            "points": self.points,
            "timestamp": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "quiz": self.quiz.to_dict()
        }