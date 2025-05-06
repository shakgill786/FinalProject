from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Feedback, User, Quiz, ClassroomQuiz
from datetime import datetime

feedback_routes = Blueprint("feedback", __name__)

def is_teacher():
    return current_user.role == "instructor"

# ─── CREATE FEEDBACK ──────────────────────────────
@feedback_routes.route("", methods=["POST"])
@login_required
def create_feedback():
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    data = request.get_json() or {}
    student_id = data.get("student_id")
    quiz_id = data.get("quiz_id")  # Nullable
    content = data.get("content", "").strip()

    if not student_id or not content:
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

# ─── GET FEEDBACK FOR STUDENT ─────────────────────
@feedback_routes.route("/student/<int:student_id>", methods=["GET"])
@login_required
def get_feedback_for_student(student_id):
    if current_user.id != student_id and not is_teacher():
        return {"error": "Unauthorized"}, 403

    feedbacks = Feedback.query.filter_by(student_id=student_id).order_by(Feedback.created_at.desc()).all()
    return jsonify([f.to_dict() for f in feedbacks]), 200

# ─── GET FEEDBACK FOR STUDENT IN CLASSROOM ────────
@feedback_routes.route("/student/<int:student_id>/classroom/<int:classroom_id>", methods=["GET"])
@login_required
def get_feedback_for_student_in_classroom(student_id, classroom_id):
    if current_user.id != student_id and not is_teacher():
        return {"error": "Unauthorized"}, 403

    quiz_ids = [cq.quiz_id for cq in ClassroomQuiz.query.filter_by(classroom_id=classroom_id).all()]
    feedbacks = Feedback.query.filter(
        Feedback.student_id == student_id,
        (Feedback.quiz_id == None) | (Feedback.quiz_id.in_(quiz_ids))
    ).order_by(Feedback.created_at.desc()).all()

    return jsonify([f.to_dict() for f in feedbacks]), 200

# ─── UPDATE FEEDBACK ───────────────────────────────
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

# ─── DELETE FEEDBACK ───────────────────────────────
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

# ─── GET ALL QUIZZES FOR THIS TEACHER ─────────────
@feedback_routes.route("/instructor-quizzes", methods=["GET"])
@login_required
def get_instructor_quizzes():
    if not is_teacher():
        return {"error": "Unauthorized"}, 403

    quizzes = Quiz.query.filter_by(instructor_id=current_user.id).all()
    return jsonify([q.to_dict() for q in quizzes]), 200