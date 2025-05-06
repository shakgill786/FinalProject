# app/api/classroom_routes.py

from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from app.models import db, Classroom, User, ClassroomQuiz, Quiz
from app.models.quiz_attempt import QuizAttempt

classroom_routes = Blueprint("classrooms", __name__)


# ── CRUD CLASSROOM ──────────────────────────────────────────

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
    classrooms_with_quizzes = []

    for c in classes:
        class_dict = c.to_dict()
        quiz_ids = [cq.quiz_id for cq in ClassroomQuiz.query.filter_by(classroom_id=c.id)]
        quizzes = Quiz.query.filter(Quiz.id.in_(quiz_ids)).all()
        class_dict["quizzes"] = [q.to_dict() for q in quizzes]
        classrooms_with_quizzes.append(class_dict)

    return jsonify(classrooms_with_quizzes)


@classroom_routes.route("/<int:classroom_id>", methods=["GET"])
@login_required
def get_single_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    class_dict = cls.to_dict()
    quiz_ids = [cq.quiz_id for cq in ClassroomQuiz.query.filter_by(classroom_id=classroom_id)]
    quizzes = Quiz.query.filter(Quiz.id.in_(quiz_ids)).all()
    class_dict["quizzes"] = [q.to_dict() for q in quizzes]

    return jsonify(class_dict)


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


# ── STUDENT MANAGEMENT ─────────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/students", methods=["POST"])
@login_required
def modify_classroom_students(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    student_id = data.get("student_id")
    action = data.get("action")

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


# ── CLASS QUIZ ASSIGNMENTS ─────────────────────────────────

@classroom_routes.route("/<int:classroom_id>/assign-quiz", methods=["POST"])
@login_required
def toggle_quiz_assignment_to_classroom(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403
    quiz_id = request.json.get("quiz_id")
    if not quiz_id:
        return {"error": "Quiz ID required"}, 400

    existing = ClassroomQuiz.query.filter_by(
        classroom_id=classroom_id, quiz_id=quiz_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {"message": "Quiz unassigned from class"}, 200
    else:
        db.session.add(ClassroomQuiz(classroom_id=classroom_id, quiz_id=quiz_id))
        db.session.commit()
        return {"message": "Quiz assigned to class"}, 201


# ── INDIVIDUAL STUDENT ASSIGNMENT TOGGLE ───────────────────

@classroom_routes.route("/<int:classroom_id>/assign-quiz-to-student", methods=["POST"])
@login_required
def toggle_quiz_assignment_to_student(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    quiz_id = data.get("quiz_id")
    student_id = data.get("student_id")

    if not quiz_id or not student_id:
        return {"error": "Missing quiz_id or student_id"}, 400

    student = User.query.get(student_id)
    if not student or student.role != "student":
        return {"error": "Invalid student"}, 400
    if student not in cls.students:
        return {"error": "Student is not in this classroom"}, 400

    existing = QuizAttempt.query.filter_by(
        user_id=student_id, quiz_id=quiz_id, status="assigned"
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return {"message": "Unassigned from student"}, 200

    new_attempt = QuizAttempt(
        user_id=student_id,
        quiz_id=quiz_id,
        status="assigned",
        score=0
    )
    db.session.add(new_attempt)
    db.session.commit()
    return {"message": "Assigned to student"}, 201


# ── FETCH CLASSROOM ASSIGNMENTS ────────────────────────────

@classroom_routes.route("/<int:classroom_id>/assignments", methods=["GET"])
@login_required
def get_classroom_quiz_assignments(classroom_id):
    cls = Classroom.query.get_or_404(classroom_id)
    if cls.instructor_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    class_assigned_quiz_ids = [
        cq.quiz_id for cq in ClassroomQuiz.query.filter_by(classroom_id=classroom_id)
    ]

    student_assignments = {}
    student_names_by_quiz = {}

    for student in cls.students:
        attempts = QuizAttempt.query.filter_by(
            user_id=student.id, status="assigned"
        ).all()
        student_assignments[str(student.id)] = [a.quiz_id for a in attempts]
        for a in attempts:
            if a.quiz_id not in student_names_by_quiz:
                student_names_by_quiz[a.quiz_id] = []
            student_names_by_quiz[a.quiz_id].append(student.username)

    return jsonify({
        "class_assigned_quiz_ids": class_assigned_quiz_ids,
        "student_assignments": student_assignments,
        "student_names_by_quiz": student_names_by_quiz
    })