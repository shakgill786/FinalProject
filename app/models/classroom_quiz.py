from .db import db, environment, SCHEMA, add_prefix_for_prod

class ClassroomQuiz(db.Model):
    __tablename__ = 'classroom_quizzes'
    if environment == 'production' and SCHEMA:
        __table_args__ = {'schema': SCHEMA}

    classroom_id = db.Column(
        db.Integer,
        db.ForeignKey(f"{add_prefix_for_prod('classrooms')}.id"),
        primary_key=True
    )
    quiz_id = db.Column(
        db.Integer,
        db.ForeignKey(f"{add_prefix_for_prod('quizzes')}.id"),
        primary_key=True
    )

    classroom = db.relationship('Classroom', back_populates='quiz_assignments')
    quiz = db.relationship('Quiz', back_populates='classroom_assignments')
