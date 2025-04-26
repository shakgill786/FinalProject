# app/api/classroom_routes.py

from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.models import db, Classroom, User

classroom_routes = Blueprint("classrooms", __name__)

# ✅ Create a new classroom
@classroom_routes.route("/", methods=["POST"])
@login_required
def create_classroom():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    name = data.get("name")

    if not name:
        return {"error": "Classroom name is required"}, 400

    classroom = Classroom(
        name=name,
        instructor_id=current_user.id
    )
    db.session.add(classroom)
    db.session.commit()
    return classroom.to_dict(), 201


# ✅ Get all classrooms for instructor
@classroom_routes.route("/", methods=["GET"])
@login_required
def get_classrooms():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classrooms = Classroom.query.filter_by(instructor_id=current_user.id).all()
    return jsonify([classroom.to_dict() for classroom in classrooms])


# ✅ Get one classroom by ID
@classroom_routes.route("/<int:classroom_id>", methods=["GET"])
@login_required
def get_single_classroom(classroom_id):
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classroom = Classroom.query.get_or_404(classroom_id)

    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    return jsonify(classroom.to_dict())


# ✅ Update classroom name
@classroom_routes.route("/<int:classroom_id>", methods=["PUT"])
@login_required
def update_classroom(classroom_id):
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classroom = Classroom.query.get_or_404(classroom_id)

    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    new_name = data.get("name")

    if new_name:
        classroom.name = new_name

    db.session.commit()
    return classroom.to_dict()


# ✅ Delete classroom
@classroom_routes.route("/<int:classroom_id>", methods=["DELETE"])
@login_required
def delete_classroom(classroom_id):
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classroom = Classroom.query.get_or_404(classroom_id)

    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(classroom)
    db.session.commit()
    return {"message": "Classroom deleted"}


# ✅ Add/remove students from classroom
@classroom_routes.route("/<int:classroom_id>/students", methods=["POST"])
@login_required
def modify_classroom_students(classroom_id):
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classroom = Classroom.query.get_or_404(classroom_id)

    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    student_id = data.get("student_id")
    action = data.get("action")

    student = User.query.get(student_id)
    if not student or student.role != "student":
        return {"error": "Invalid student"}, 400

    if action == "add":
        if student not in classroom.students:
            classroom.students.append(student)
    elif action == "remove":
        if student in classroom.students:
            classroom.students.remove(student)
    else:
        return {"error": "Invalid action"}, 400

    db.session.commit()
    return classroom.to_dict()
