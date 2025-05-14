from .db import db, environment, SCHEMA, add_prefix_for_prod

class Question(db.Model):
    __tablename__ = "questions"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(255), nullable=False)
    options = db.Column(db.PickleType, nullable=False)
    answer = db.Column(db.String(100), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("quizzes.id")), nullable=False)

    quiz = db.relationship("Quiz", back_populates="questions")

    def to_dict(self):
        return {
            "id": self.id,
            "question_text": self.question_text,
            "options": self.options,
            "answer": self.answer,
            "quiz_id": self.quiz_id
        }