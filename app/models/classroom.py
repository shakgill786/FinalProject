from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Classroom(db.Model):
    __tablename__ = 'classrooms'
    if environment == 'production' and SCHEMA:
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    instructor_id = db.Column(
        db.Integer,
        db.ForeignKey(f"{add_prefix_for_prod('users')}.id"),
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    instructor = db.relationship('User', back_populates='classrooms')
    students = db.relationship(
        'User',
        secondary=add_prefix_for_prod('classroom_students'),
        back_populates='enrolled_classrooms'
    )
    quiz_assignments = db.relationship(
        'ClassroomQuiz',
        back_populates='classroom',
        cascade='all, delete-orphan'
    )

    def to_dict(self, include_quizzes=False):
        data = {
            'id': self.id,
            'name': self.name,
            'instructor_id': self.instructor_id,
            'created_at': self.created_at.isoformat(),
            'students': [s.to_dict() for s in self.students]
        }
        if include_quizzes:
            from .quiz import Quiz
            quiz_ids = [cq.quiz_id for cq in self.quiz_assignments]
            data['quizzes'] = [q.to_dict() for q in Quiz.query.filter(Quiz.id.in_(quiz_ids)).all()]
        return data
