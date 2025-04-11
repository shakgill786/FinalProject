from flask import Blueprint, request, jsonify
from app.models import db, Quiz, Question

quiz_routes = Blueprint("quizzes", __name__)

# Create a new quiz
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

# Get all quizzes
@quiz_routes.route("/", methods=["GET"])
def get_quizzes():
    quizzes = Quiz.query.all()
    return jsonify([quiz.to_dict() for quiz in quizzes])

# Create a question for a specific quiz
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

# Get all questions for a quiz
@quiz_routes.route("/<int:quiz_id>/questions", methods=["GET"])
def get_questions_for_quiz(quiz_id):
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    return jsonify([q.to_dict() for q in questions])
