# app/api/quiz_routes.py

from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from sqlalchemy import func
from app.models import db, Quiz, Question, QuizAttempt, User
from app.models.classroom_quiz import ClassroomQuiz

quiz_routes = Blueprint("quizzes", __name__)


@quiz_routes.route("/", methods=["POST"])
@login_required
def create_quiz():
    data        = request.get_json() or {}
    title       = data.get("title", "").strip()
    description = data.get("description", "").strip()
    grade_level = data.get("grade_level", "").strip()

    errors = []
    if not title:
        errors.append("Title is required.")
    if errors:
        return {"errors": errors}, 400

    quiz = Quiz(title=title, description=description, grade_level=grade_level)
    db.session.add(quiz)
    db.session.commit()
    return jsonify(quiz.to_dict()), 201


@quiz_routes.route("", methods=["GET"])
@quiz_routes.route("/", methods=["GET"])
@login_required
def get_quizzes():
    if current_user.role == "student":
        # classroom‐wide assignments
        class_ids      = [c.id for c in current_user.enrolled_classrooms]
        class_qs       = ClassroomQuiz.query.filter(
                            ClassroomQuiz.classroom_id.in_(class_ids)
                         ).all()
        class_quiz_ids = {cq.quiz_id for cq in class_qs}

        # individual assignments (stored as QuizAttempt.status="assigned")
        indiv          = QuizAttempt.query.filter_by(
                            user_id=current_user.id, status="assigned"
                         ).all()
        indiv_ids      = {a.quiz_id for a in indiv}

        allowed        = class_quiz_ids.union(indiv_ids)
        if not allowed:
            return jsonify([]), 200

        quizzes = Quiz.query.filter(Quiz.id.in_(allowed)).all()
    else:
        quizzes = Quiz.query.all()

    return jsonify([q.to_dict() for q in quizzes]), 200


@quiz_routes.route("/<int:quiz_id>", methods=["GET"])
@login_required
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    return jsonify(quiz.to_dict()), 200


@quiz_routes.route("/<int:quiz_id>", methods=["PUT"])
@login_required
def update_quiz(quiz_id):
    data        = request.get_json() or {}
    title       = data.get("title", "").strip()
    description = data.get("description", "").strip()
    grade_level = data.get("grade_level", "").strip()

    errors = []
    if not title:
        errors.append("Title is required.")
    if errors:
        return {"errors": errors}, 400

    quiz = Quiz.query.get_or_404(quiz_id)
    quiz.title       = title
    quiz.description = description
    quiz.grade_level = grade_level
    db.session.commit()
    return jsonify(quiz.to_dict()), 200


@quiz_routes.route("/<int:quiz_id>", methods=["DELETE"])
@login_required
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    db.session.delete(quiz)
    db.session.commit()
    return {"message": "Quiz deleted"}, 200


@quiz_routes.route("/<int:quiz_id>/questions", methods=["POST"])
@login_required
def create_question(quiz_id):
    data           = request.get_json() or {}
    question_text  = data.get("question_text", "").strip()
    options        = data.get("options")
    answer         = data.get("answer", "").strip()

    errors = []
    if not question_text:
        errors.append("Question text is required.")
    if not isinstance(options, list) or len(options) < 2:
        errors.append("At least two options are required.")
    if not answer:
        errors.append("Answer is required.")
    if errors:
        return {"errors": errors}, 400

    q = Question(
        question_text=question_text,
        options=options,
        answer=answer,
        quiz_id=quiz_id
    )
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

    data           = request.get_json() or {}
    question_text  = data.get("question_text", "").strip()
    options        = data.get("options")
    answer         = data.get("answer", "").strip()

    errors = []
    if not question_text:
        errors.append("Question text is required.")
    if not isinstance(options, list) or len(options) < 2:
        errors.append("At least two options are required.")
    if not answer:
        errors.append("Answer is required.")
    if errors:
        return {"errors": errors}, 400

    q.question_text = question_text
    q.options       = options
    q.answer        = answer
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


@quiz_routes.route("/<int:quiz_id>/attempt", methods=["POST"])
@login_required
def log_quiz_attempt(quiz_id):
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    data       = request.get_json() or {}
    score      = data.get("score")
    timestamps = data.get("timestamps", [])
    if score is None or not isinstance(timestamps, list):
        return {"error": "Missing score or timestamps"}, 400

    points_list = data.get("points", [])
    total_points = sum(points_list) if isinstance(points_list, list) else 0
    at = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        points=total_points
    )
    db.session.add(at)
    db.session.commit()
    return {"message": "Attempt logged", "attempt": at.to_dict()}, 201


@quiz_routes.route("/history", methods=["GET"])
@login_required
def get_student_history():
    """
    Only return **actual** quiz‐attempts (exclude any with status="assigned").
    """
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    attempts = QuizAttempt.query \
        .filter(
            QuizAttempt.user_id == current_user.id,
            QuizAttempt.status  != "assigned"
        ) \
        .order_by(QuizAttempt.created_at.desc()) \
        .all()

    history = []
    for a in attempts:
        badges = []
        if a.score == 100:
            badges.append("Accuracy Ace")
        if a.points >= len(a.quiz.questions) * 7:  # 70% threshold
            badges.append("Fast Thinker")

        history.append({
            "id": a.quiz.id,
            "title": a.quiz.title,
            "score": a.score,
            "points": a.points,
            "date": a.created_at.strftime("%Y-%m-%d"),
            "badges": badges
        })

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
        {"user_id": user_id, "username": username, "total_points": int(points or 0)}
        for user_id, username, points in results
    ]), 200


@quiz_routes.route("/me/points", methods=["GET"])
@login_required
def get_my_points():
    if current_user.role != "student":
        return {"error": "Unauthorized"}, 403

    total = db.session.query(func.sum(QuizAttempt.points)) \
        .filter_by(user_id=current_user.id) \
        .scalar()

    return jsonify({
        "username": current_user.username,
        "total_points": int(total or 0)
    }), 200