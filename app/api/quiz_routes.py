from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from datetime import datetime
from sqlalchemy import func
from app.models import db, Quiz, Question, QuizAttempt, User
from app.models.classroom_quiz import ClassroomQuiz

quiz_routes = Blueprint("quizzes", __name__)

# ✅ Create a new quiz
@quiz_routes.route("", methods=["POST"])
@quiz_routes.route("/", methods=["POST"])
def create_quiz():
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    grade_level = data.get("grade_level")

    if not title:
        return {"errors": ["Title is required."]}, 400

    quiz = Quiz(title=title, description=description, grade_level=grade_level)
    db.session.add(quiz)
    db.session.commit()
    return quiz.to_dict(), 201

# 🔓 Public: Get all quizzes (no login required)
@quiz_routes.route("", methods=["GET"])
@quiz_routes.route("/", methods=["GET"])
def get_quizzes():
    quizzes = Quiz.query.all()
    return jsonify([quiz.to_dict() for quiz in quizzes])

# ✅ Delete a quiz
@quiz_routes.route("/<int:quiz_id>", methods=["DELETE"])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return {"error": "Quiz not found"}, 404
    db.session.delete(quiz)
    db.session.commit()
    return {"message": "Quiz deleted"}, 200

# ✅ Questions CRUD…
@quiz_routes.route("/<int:quiz_id>/questions", methods=["POST"])
def create_question(quiz_id):
    data = request.get_json()
    question_text = data.get("question_text")
    options = data.get("options")
    answer = data.get("answer")
    if not question_text or not options or not answer:
        return {"errors": ["All fields are required."]}, 400
    q = Question(question_text=question_text, options=options, answer=answer, quiz_id=quiz_id)
    db.session.add(q)
    db.session.commit()
    return q.to_dict(), 201

@quiz_routes.route("/<int:quiz_id>/questions", methods=["GET"])
def get_questions_for_quiz(quiz_id):
    qs = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([q.to_dict() for q in qs])

@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["PUT"])
def update_question(quiz_id, question_id):
    data = request.get_json()
    q = Question.query.get_or_404(question_id)
    if q.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400
    q.question_text = data.get("question_text", q.question_text)
    q.options       = data.get("options", q.options)
    q.answer        = data.get("answer", q.answer)
    db.session.commit()
    return q.to_dict()

@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["DELETE"])
def delete_question(quiz_id, question_id):
    q = Question.query.get_or_404(question_id)
    if q.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400
    db.session.delete(q)
    db.session.commit()
    return {"message": "Question deleted successfully"}, 200

# ✅ POST: Log a quiz attempt with timing-based points
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

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        points=total_points
    )
    db.session.add(attempt)
    db.session.commit()

    return {"message": "Attempt logged", "attempt": attempt.to_dict()}

# ✅ GET: Student quiz history
@quiz_routes.route("/history", methods=["GET"])
@login_required
def get_student_history():
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    attempts = (
        QuizAttempt.query
        .filter_by(user_id=current_user.id)
        .order_by(QuizAttempt.created_at.desc())
        .all()
    )
    history = [{
        "id": a.quiz.id,
        "title": a.quiz.title,
        "score": a.score,
        "points": a.points,
        "date": a.created_at.strftime("%Y-%m-%d")
    } for a in attempts]
    return jsonify(history)

# ✅ GET: Global leaderboard
@quiz_routes.route("/leaderboard", methods=["GET"])
@login_required
def leaderboard():
    results = (
        db.session.query(
            User.id.label("user_id"),
            User.username,
            func.sum(QuizAttempt.points).label("total_points")
        )
        .join(QuizAttempt, QuizAttempt.user_id == User.id)
        .group_by(User.id)
        .order_by(func.sum(QuizAttempt.points).desc())
        .limit(10)
        .all()
    )
    lb = [{
        "user_id":   u,
        "username":  n,
        "total_points": int(tp or 0)
    } for u, n, tp in results]
    return jsonify(lb)
