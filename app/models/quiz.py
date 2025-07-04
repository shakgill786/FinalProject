from .db import db, environment, SCHEMA, add_prefix_for_prod

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    if environment == 'production' and SCHEMA:
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    grade_level = db.Column(db.String(20))
    instructor_id = db.Column(
        db.Integer,
        db.ForeignKey(f"{add_prefix_for_prod('users')}.id"),
        nullable=True
    )

    instructor = db.relationship('User', back_populates='quizzes')
    questions = db.relationship('Question', back_populates='quiz', cascade='all, delete-orphan')
    quiz_attempts = db.relationship('QuizAttempt', back_populates='quiz', cascade='all, delete-orphan')
    classroom_assignments = db.relationship('ClassroomQuiz', back_populates='quiz', cascade='all, delete-orphan')
    feedbacks = db.relationship('Feedback', back_populates='quiz', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'grade_level': self.grade_level
        }
