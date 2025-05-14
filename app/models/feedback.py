from datetime import datetime
from sqlalchemy.sql import func
from app.models.db import db, environment, SCHEMA, add_prefix_for_prod
import pytz

class Feedback(db.Model):
    __tablename__ = "feedback"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("quizzes.id")), nullable=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())

    teacher = db.relationship("User", foreign_keys=[teacher_id], backref="given_feedback")
    student = db.relationship("User", foreign_keys=[student_id], backref="received_feedback")
    quiz = db.relationship("Quiz", back_populates="feedbacks")

    def to_dict(self):
        eastern = pytz.timezone("US/Eastern")
        local_time = self.created_at.astimezone(eastern)
        return {
            "id": self.id,
            "teacher_id": self.teacher_id,
            "student_id": self.student_id,
            "quiz_id": self.quiz_id,
            "content": self.content,
            "created_at": local_time.strftime("%Y-%m-%d %I:%M %p"),
            "teacher_name": self.teacher.username if self.teacher else None,
            "student_name": self.student.username if self.student else None,
            "quiz_title": self.quiz.title if self.quiz else "General Feedback",
        }