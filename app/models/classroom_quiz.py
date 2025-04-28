# app/models/classroom_quiz.py

from .db import db, environment, SCHEMA, add_prefix_for_prod

class ClassroomQuiz(db.Model):
    __tablename__ = "classroom_quizzes"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    classroom_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("classrooms.id")), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("quizzes.id")), nullable=False)

    classroom = db.relationship("Classroom", back_populates="assigned_quizzes")
    quiz = db.relationship("Quiz", back_populates="classroom_assignments")
