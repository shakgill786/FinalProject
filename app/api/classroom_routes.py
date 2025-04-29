from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.models import db, Classroom, User, QuizAttempt, Quiz
from app.models.classroom_quiz import ClassroomQuiz

classroom_routes = Blueprint("classrooms", __name__)

# Create a new classroom
@classroom_routes.route("/", methods=["POST"])
@login_required
def create_classroom():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    name = data.get("name")

    if not name:
        return {"error": "Classroom name is required"}, 400

    classroom = Classroom(name=name, instructor_id=current_user.id)
    db.session.add(classroom)
    db.session.commit()
    return classroom.to_dict(), 201


# Get all classrooms for instructor
@classroom_routes.route("/", methods=["GET"])
@login_required
def get_classrooms():
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classrooms = Classroom.query.filter_by(instructor_id=current_user.id).all()
    return jsonify([classroom.to_dict() for classroom in classrooms])


# Get single classroom
@classroom_routes.route("/<int:classroom_id>", methods=["GET"])
@login_required
def get_single_classroom(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if current_user.id != classroom.instructor_id:
        return {"error": "Unauthorized"}, 403
    return jsonify(classroom.to_dict())


# Update classroom name
@classroom_routes.route("/<int:classroom_id>", methods=["PUT"])
@login_required
def update_classroom(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    new_name = data.get("name")
    if new_name:
        classroom.name = new_name
    db.session.commit()
    return classroom.to_dict()


# Delete classroom
@classroom_routes.route("/<int:classroom_id>", methods=["DELETE"])
@login_required
def delete_classroom(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(classroom)
    db.session.commit()
    return {"message": "Classroom deleted"}


# Add or remove student from classroom
@classroom_routes.route("/<int:classroom_id>/students", methods=["POST"])
@login_required
def modify_classroom_students(classroom_id):
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


# Assign quiz to entire classroom
@classroom_routes.route("/<int:classroom_id>/assign-quiz", methods=["POST"])
@login_required
def assign_quiz_to_classroom(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    quiz_id = data.get("quiz_id")

    if not quiz_id:
        return {"error": "Quiz ID required"}, 400

    exists = ClassroomQuiz.query.filter_by(classroom_id=classroom_id, quiz_id=quiz_id).first()
    if exists:
        return {"error": "Quiz already assigned"}, 400

    assignment = ClassroomQuiz(classroom_id=classroom_id, quiz_id=quiz_id)
    db.session.add(assignment)
    db.session.commit()
    return {"message": "Quiz assigned to class!"}, 201


# Assign quiz to individual student
@classroom_routes.route("/<int:classroom_id>/assign-quiz-to-student", methods=["POST"])
@login_required
def assign_quiz_to_student(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    quiz_id = data.get("quiz_id")
    student_id = data.get("student_id")

    if not quiz_id or not student_id:
        return {"error": "Missing quiz_id or student_id"}, 400

    existing = QuizAttempt.query.filter_by(
        user_id=student_id,
        quiz_id=quiz_id,
        status="assigned"
    ).first()
    if existing:
        return {"error": "Already assigned to student"}, 400

    assignment = QuizAttempt(user_id=student_id, quiz_id=quiz_id, status="assigned")
    db.session.add(assignment)
    db.session.commit()
    return {"message": "Quiz assigned to student!"}, 201

# Get all assignments for a classroom (both class-wide and per-student)
@classroom_routes.route("/<int:classroom_id>/assignments", methods=["GET"])
@login_required
def get_classroom_assignments(classroom_id):
    if current_user.role != "instructor":
        return {"error": "Unauthorized"}, 403

    classroom = Classroom.query.get_or_404(classroom_id)

    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    # ✅ Class-wide assignments (ClassroomQuiz)
    from app.models.classroom_quiz import ClassroomQuiz
    class_assigned_quiz_ids = [
        cq.quiz_id for cq in ClassroomQuiz.query.filter_by(classroom_id=classroom_id).all()
    ]

    # ✅ Individual student assignments (QuizAttempt with status='assigned')
    from app.models.quiz_attempt import QuizAttempt
    attempts = QuizAttempt.query.filter_by(status="assigned").all()

    student_assignments = {}
    for attempt in attempts:
        student_id = str(attempt.user_id)
        if student_id not in student_assignments:
            student_assignments[student_id] = []
        student_assignments[student_id].append(attempt.quiz_id)

    return jsonify({
        "class_assigned_quiz_ids": class_assigned_quiz_ids,
        "student_assignments": student_assignments
    })

# ✅ NEW: Get all quiz assignments for classroom
@classroom_routes.route("/<int:classroom_id>/assignments", methods=["GET"])
@login_required
def get_all_assignments(classroom_id):
    classroom = Classroom.query.get_or_404(classroom_id)
    if classroom.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    # Class-wide assignments
    class_quizzes = ClassroomQuiz.query.filter_by(classroom_id=classroom_id).all()
    class_quiz_ids = [cq.quiz_id for cq in class_quizzes]

    # Student-specific assignments
    student_assignments = {}
    for student in classroom.students:
        assigned_attempts = QuizAttempt.query.filter_by(
            user_id=student.id,
            status="assigned"
        ).all()
        student_assignments[student.id] = {
            "username": student.username,
            "quiz_ids": [attempt.quiz_id for attempt in assigned_attempts]
        }

    return jsonify({
        "class_quiz_ids": class_quiz_ids,
        "student_assignments": student_assignments
    })
