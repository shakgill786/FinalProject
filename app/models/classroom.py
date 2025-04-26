# app/models/classroom.py

from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Classroom(db.Model):
    __tablename__ = "classrooms"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    instructor_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    instructor = db.relationship("User", back_populates="classrooms")
    students = db.relationship(
        "User",
        secondary=add_prefix_for_prod("classroom_students"),
        back_populates="enrolled_classrooms"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "instructor_id": self.instructor_id,
            "created_at": self.created_at.isoformat(),
            "students": [student.to_dict() for student in self.students]
        }
