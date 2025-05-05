# app/api/feedback_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Feedback, User, Quiz
from datetime import datetime

feedback_routes = Blueprint("feedback", __name__)

def is_teacher():
    return current_user.role == "instructor"

# ─── CREATE FEEDBACK ──────────────────────────────────────────────
@feedback_routes.route("", methods=["POST"])
@login_required
def create_feedback():
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    data = request.get_json() or {}
    student_id = data.get("student_id")
    quiz_id = data.get("quiz_id")
    content = data.get("content", "").strip()

    if not student_id or not quiz_id or not content:
        return {"error": "Missing required fields"}, 400

    feedback = Feedback(
        teacher_id=current_user.id,
        student_id=student_id,
        quiz_id=quiz_id,
        content=content,
        created_at=datetime.utcnow()
    )
    db.session.add(feedback)
    db.session.commit()
    return jsonify(feedback.to_dict()), 201

# ─── READ FEEDBACK FOR A STUDENT ──────────────────────────────────
@feedback_routes.route("/student/<int:student_id>", methods=["GET"])
@login_required
def get_feedback_for_student(student_id):
    if current_user.id != student_id and not is_teacher():
        return {"error": "Unauthorized"}, 403

    feedbacks = Feedback.query.filter_by(student_id=student_id).order_by(Feedback.created_at.desc()).all()
    return jsonify([
        {
            "id": f.id,
            "content": f.content,
            "created_at": f.created_at.strftime("%Y-%m-%d %H:%M"),
            "teacher_name": f.teacher.username,
            "quiz_title": f.quiz.title
        } for f in feedbacks
    ]), 200

# ─── READ FEEDBACK FOR A SPECIFIC QUIZ & STUDENT ──────────────────
@feedback_routes.route("/quiz/<int:quiz_id>/student/<int:student_id>", methods=["GET"])
@login_required
def get_feedback_for_quiz_and_student(quiz_id, student_id):
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    feedbacks = Feedback.query.filter_by(quiz_id=quiz_id, student_id=student_id).order_by(Feedback.created_at.desc()).all()
    return jsonify([
        {
            "id": f.id,
            "content": f.content,
            "created_at": f.created_at.strftime("%Y-%m-%d %H:%M"),
            "teacher_name": f.teacher.username
        } for f in feedbacks
    ]), 200

# ─── UPDATE FEEDBACK ───────────────────────────────────────────────
@feedback_routes.route("/<int:feedback_id>", methods=["PUT"])
@login_required
def update_feedback(feedback_id):
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    feedback = Feedback.query.get_or_404(feedback_id)
    if feedback.teacher_id != current_user.id:
        return {"error": "Permission denied"}, 403

    data = request.get_json() or {}
    content = data.get("content", "").strip()

    if not content:
        return {"error": "Content is required"}, 400

    feedback.content = content
    db.session.commit()
    return jsonify(feedback.to_dict()), 200

# ─── DELETE FEEDBACK ───────────────────────────────────────────────
@feedback_routes.route("/<int:feedback_id>", methods=["DELETE"])
@login_required
def delete_feedback(feedback_id):
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    feedback = Feedback.query.get_or_404(feedback_id)
    if feedback.teacher_id != current_user.id:
        return {"error": "Permission denied"}, 403

    db.session.delete(feedback)
    db.session.commit()
    return {"message": "Feedback deleted"}, 200
