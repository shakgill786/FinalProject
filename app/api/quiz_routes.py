from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from datetime import datetime
from sqlalchemy import func
from app.models import db, Quiz, Question, QuizAttempt, User

quiz_routes = Blueprint("quizzes", __name__)

# ✅ Create a new quiz
@quiz_routes.route("/", methods=["POST"])
@quiz_routes.route("", methods=["POST"])
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

# ✅ Get all quizzes
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

# ✅ Create a question for a specific quiz
@quiz_routes.route("/<int:quiz_id>/questions", methods=["POST"])
def create_question(quiz_id):
    data = request.get_json()
    question_text = data.get("question_text")
    options = data.get("options")
    answer = data.get("answer")

    if not question_text or not options or not answer:
        return {"errors": ["All fields are required."]}, 400

    question = Question(
        question_text=question_text,
        options=options,
        answer=answer,
        quiz_id=quiz_id
    )
    db.session.add(question)
    db.session.commit()
    return question.to_dict(), 201

# ✅ Get all questions for a quiz
@quiz_routes.route("/<int:quiz_id>/questions", methods=["GET"])
def get_questions_for_quiz(quiz_id):
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([q.to_dict() for q in questions])

# ✅ Update a specific question
@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["PUT"])
def update_question(quiz_id, question_id):
    data = request.get_json()
    question = Question.query.get_or_404(question_id)

    if question.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400

    question.question_text = data.get("question_text", question.question_text)
    question.options = data.get("options", question.options)
    question.answer = data.get("answer", question.answer)

    db.session.commit()
    return question.to_dict()

# ✅ Delete a specific question
@quiz_routes.route("/<int:quiz_id>/questions/<int:question_id>", methods=["DELETE"])
def delete_question(quiz_id, question_id):
    question = Question.query.get_or_404(question_id)

    if question.quiz_id != quiz_id:
        return {"error": "Invalid quiz ID."}, 400

    db.session.delete(question)
    db.session.commit()
    return {"message": "Question deleted successfully"}, 200

# ✅ POST: Log a quiz attempt with timing-based points
@quiz_routes.route("/<int:quiz_id>/attempt", methods=["POST"])
@login_required
def log_quiz_attempt(quiz_id):
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    score = data.get("score")
    timestamps = data.get("timestamps")  # array of floats

    if score is None or not isinstance(timestamps, list):
        return {"error": "Missing score or timestamps"}, 400

    total_points = 0
    for t in timestamps:
        if t <= 2:
            total_points += 10
        elif t <= 5:
            total_points += 5
        else:
            total_points += 2

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

    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.created_at.desc()).all()
    history = [
        {
            "id": attempt.quiz.id,
            "title": attempt.quiz.title,
            "score": attempt.score,
            "points": attempt.points,
            "date": attempt.created_at.strftime("%Y-%m-%d")
        }
        for attempt in attempts
    ]
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

    leaderboard = [
        {
            "user_id": user_id,
            "username": username,
            "total_points": int(total_points or 0)
        }
        for user_id, username, total_points in results
    ]

    return jsonify(leaderboard)
