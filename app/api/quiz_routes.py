# app/api/quiz_routes.py

from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from sqlalchemy import func
from app.models import db, Quiz, Question, QuizAttempt, User
from app.models.classroom_quiz import ClassroomQuiz

quiz_routes = Blueprint("quizzes", __name__)


#
# ─── CREATE A NEW QUIZ ────────────────────────────────────────────────────────────
#
@quiz_routes.route("/", methods=["POST"])
def create_quiz():
    data = request.get_json()
    title       = data.get("title")
    description = data.get("description")
    grade_level = data.get("grade_level")

    if not title:
        return {"errors": ["Title is required."]}, 400

    quiz = Quiz(title=title, description=description, grade_level=grade_level)
    db.session.add(quiz)
    db.session.commit()
    return quiz.to_dict(), 201


#
# ─── LIST QUIZZES ───────────────────────────────────────────────────────────────
#
@quiz_routes.route("",  methods=["GET"])
@quiz_routes.route("/", methods=["GET"])
@login_required
def get_quizzes():
    # Students only see quizzes assigned to them (via class or individually)
    if current_user.role == "student":
        # 1) class-wide assignments
        class_ids = [c.id for c in current_user.enrolled_classrooms]
        class_qs = ClassroomQuiz.query.filter(
            ClassroomQuiz.classroom_id.in_(class_ids)
        ).all()
        class_quiz_ids = {cq.quiz_id for cq in class_qs}

        # 2) individual assignments (status == "assigned")
        indiv = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            status="assigned"
        ).all()
        indiv_ids = {a.quiz_id for a in indiv}

        allowed = class_quiz_ids.union(indiv_ids)
        if not allowed:
            return jsonify([]), 200

        quizzes = Quiz.query.filter(Quiz.id.in_(allowed)).all()
    else:
        # instructors & admins see everything
        quizzes = Quiz.query.all()

    return jsonify([q.to_dict() for q in quizzes]), 200


#
# ─── GET A SINGLE QUIZ ──────────────────────────────────────────────────────────
#
@quiz_routes.route("/<int:quiz_id>", methods=["GET"])
@login_required
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify(quiz.to_dict()), 200


#
# ─── UPDATE A QUIZ ─────────────────────────────────────────────────────────────
#
@quiz_routes.route("/<int:quiz_id>", methods=["PUT"])
@login_required
def update_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    # you could check instructor ownership here if you like
    data = request.get_json()
    quiz.title       = data.get("title", quiz.title)
    quiz.description = data.get("description", quiz.description)
    quiz.grade_level = data.get("grade_level", quiz.grade_level)
    db.session.commit()
    return jsonify(quiz.to_dict()), 200


#
# ─── DELETE A QUIZ ─────────────────────────────────────────────────────────────
#
@quiz_routes.route("/<int:quiz_id>", methods=["DELETE"])
@login_required
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    db.session.delete(quiz)
    db.session.commit()
    return {"message": "Quiz deleted"}, 200


#
# ─── QUESTIONS CRUD ────────────────────────────────────────────────────────────
#
@quiz_routes.route("/<int:quiz_id>/questions", methods=["POST"])
@login_required
def create_question(quiz_id):
    data = request.get_json()
    q = Question(
        question_text = data.get("question_text"),
        options       = data.get("options"),
        answer        = data.get("answer"),
        quiz_id       = quiz_id
    )
    if not q.question_text or not q.options or not q.answer:
        return {"errors": ["All fields are required."]}, 400

    db.session.add(q)
    db.session.commit()
    return jsonify(q.to_dict()), 201

@quiz_routes.route("/<int:quiz_id>/questions", methods=["GET"])
@login_required
def get_questions_for_quiz(quiz_id):
    qs = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([q.to_dict() for q in qs]), 200

@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["PUT"])
@login_required
def update_question(quiz_id, question_id):
    q = Question.query.get_or_404(question_id)
    if q.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400

    data = request.get_json()
    q.question_text = data.get("question_text", q.question_text)
    q.options       = data.get("options", q.options)
    q.answer        = data.get("answer", q.answer)
    db.session.commit()
    return jsonify(q.to_dict()), 200

@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["DELETE"])
@login_required
def delete_question(quiz_id, question_id):
    q = Question.query.get_or_404(question_id)
    if q.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400
    db.session.delete(q)
    db.session.commit()
    return {"message": "Question deleted successfully"}, 200


#
# ─── RECORD A QUIZ ATTEMPT ──────────────────────────────────────────────────────
#
@quiz_routes.route("/<int:quiz_id>/attempt", methods=["POST"])
@login_required
def log_quiz_attempt(quiz_id):
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    data       = request.get_json()
    score      = data.get("score")
    timestamps = data.get("timestamps", [])
    if score is None or not isinstance(timestamps, list):
        return {"error": "Missing score or timestamps"}, 400

    total_points = sum(10 if t <= 2 else 5 if t <= 5 else 2 for t in timestamps)

    at = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        points=total_points
    )
    db.session.add(at)
    db.session.commit()
    return {"message": "Attempt logged", "attempt": at.to_dict()}, 201


#
# ─── STUDENT HISTORY & LEADERBOARD ─────────────────────────────────────────────
#
@quiz_routes.route("/history", methods=["GET"])
@login_required
def get_student_history():
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    attempts = QuizAttempt.query \
        .filter_by(user_id=current_user.id) \
        .order_by(QuizAttempt.created_at.desc()) \
        .all()
    history = [{
        "id":    a.quiz.id,
        "title": a.quiz.title,
        "score": a.score,
        "points": a.points,
        "date":  a.created_at.strftime("%Y-%m-%d")
    } for a in attempts]
    return jsonify(history), 200

@quiz_routes.route("/leaderboard", methods=["GET"])
@login_required
def leaderboard():
    results = db.session.query(
        User.id.label("user_id"),
        User.username,
        func.sum(QuizAttempt.points).label("total_points")
    ) \
    .join(QuizAttempt, QuizAttempt.user_id == User.id) \
    .group_by(User.id) \
    .order_by(func.sum(QuizAttempt.points).desc()) \
    .limit(10) \
    .all()

    return jsonify([
        {"user_id": uid, "username": name, "total_points": int(tp or 0)}
        for uid, name, tp in results
    ]), 200
