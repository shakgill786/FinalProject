# app/api/classroom_routes.py

from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.models import db, Classroom, User
from app.models.classroom_quiz import ClassroomQuiz
from app.models.quiz_attempt import QuizAttempt

classroom_routes = Blueprint("classrooms", __name__)


# ─── CREATE / READ / UPDATE / DELETE CLASSROOM ─────────────────────────────────

@classroom_routes.route("/", methods=["POST"])
@login_required
def create_classroom():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    name = request.json.get("name", "").strip()
    if not name:
        return {"error": "Classroom name is required"}, 400

    cls = Classroom(name=name, instructor_id=current_user.id)
    db.session.add(cls)
    db.session.commit()
    return cls.to_dict(), 201


@classroom_routes.route("/", methods=["GET"])
@login_required
def get_classrooms():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403
    classes = Classroom.query.filter_by(instructor_id=current_user.id).all()
    return jsonify([c.to_dict() for c in classes])


@classroom_routes.route("/<int:classroom_id>", methods=["GET"])
@login_required
def get_single_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403
    return jsonify(cls.to_dict())


@classroom_routes.route("/<int:classroom_id>", methods=["PUT"])
@login_required
def update_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    new_name = request.json.get("name", "").strip()
    if new_name:
        cls.name = new_name
        db.session.commit()
    return jsonify(cls.to_dict())


@classroom_routes.route("/<int:classroom_id>", methods=["DELETE"])
@login_required
def delete_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(cls)
    db.session.commit()
    return {"message": "Classroom deleted"}


# ─── MANAGE STUDENTS ──────────────────────────────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/students", methods=["POST"])
@login_required
def modify_classroom_students(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    student_id = data.get("student_id")
    action     = data.get("action")

    student = User.query.get(student_id)
    if not student or student.role != "student":
        return {"error": "Invalid student"}, 400

    if action == "add":
        if student not in cls.students:
            cls.students.append(student)
    elif action == "remove":
        if student in cls.students:
            cls.students.remove(student)
    else:
        return {"error": "Invalid action"}, 400

    db.session.commit()
    return jsonify(cls.to_dict())


# ─── ASSIGN QUIZ TO CLASS ─────────────────────────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/assign-quiz", methods=["POST"])
@login_required
def assign_quiz_to_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    quiz_id = request.json.get("quiz_id")
    if not quiz_id:
        return {"error": "Quiz ID required"}, 400

    exists = ClassroomQuiz.query.filter_by(
        classroom_id=classroom_id,
        quiz_id=quiz_id
    ).first()
    if exists:
        return {"error": "Quiz already assigned"}, 400

    assignment = ClassroomQuiz(
        classroom_id=classroom_id,
        quiz_id=quiz_id
    )
    db.session.add(assignment)
    db.session.commit()
    return {"message": "Quiz assigned to class!"}, 201


# ─── ASSIGN QUIZ TO STUDENT ───────────────────────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/assign-quiz-to-student", methods=["POST"])
@login_required
def assign_quiz_to_student(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data       = request.get_json()
    quiz_id    = data.get("quiz_id")
    student_id = data.get("student_id")

    if not quiz_id or not student_id:
        return {"error": "Missing quiz_id or student_id"}, 400

    # prevent dupes
    already = QuizAttempt.query.filter_by(
      user_id=student_id,
      quiz_id=quiz_id,
      status="assigned"
    ).first()
    if already:
        return {"error": "Already assigned to that student"}, 400

    # give them a "blank" attempt with default score=0
    assignment = QuizAttempt(
      user_id= student_id,
      quiz_id=  quiz_id,
      status=   "assigned",
      score=    0
    )
    db.session.add(assignment)
    db.session.commit()
    return {"message": "Quiz assigned to student!"}, 201


# ─── GET ALL ASSIGNMENTS ──────────────────────────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/assignments", methods=["GET"])
@login_required
def get_all_assignments(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    # 1️⃣ Class-wide
    class_qs = ClassroomQuiz.query.filter_by(classroom_id=classroom_id).all()
    class_assigned = [cq.quiz_id for cq in class_qs]

    # 2️⃣ Per-student (only “assigned” not yet completed)
    student_assignments = {}
    for st in cls.students:
        attempts = QuizAttempt.query.filter_by(
            user_id=st.id,
            status="assigned"
        ).all()
        student_assignments[str(st.id)] = [a.quiz_id for a in attempts]
    # → keys must be strings, so your front-end can do .includes()

    return jsonify({
        "class_assigned_quiz_ids": class_assigned,
        "student_assignments":    student_assignments
    })
