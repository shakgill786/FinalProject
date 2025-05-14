from .db import db, environment, SCHEMA, add_prefix_for_prod

class ClassroomStudent(db.Model):
    __tablename__ = "classroom_students"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    classroom_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("classrooms.id")),
        primary_key=True
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("users.id")),
        primary_key=True
    )