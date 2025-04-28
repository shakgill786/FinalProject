# app/seeds/seed.py

from app import app, db
from app.models import User, Quiz, Classroom
from sqlalchemy import text  # ✅ Import text

with app.app_context():
    print("🔄 Clearing old data...")

    # Delete existing rows first
    db.session.execute(text("DELETE FROM classroom_students"))
    db.session.execute(text("DELETE FROM classrooms"))
    db.session.execute(text("DELETE FROM quizzes"))
    db.session.execute(text("DELETE FROM users"))

    db.session.commit()

    print("🌱 Seeding new data...")

    # --- Users ---
    instructor = User(
        username="shak",
        email="shak@example.com",
        role="instructor"  # ✅ Instructor role
    )
    instructor.password = "password1"

    student1 = User(
        username="emma",
        email="emma@example.com",
        role="student"  # ✅ Student role
    )
    student1.password = "password2"

    student2 = User(
        username="alex",
        email="alex@example.com",
        role="student"  # ✅ Student role
    )
    student2.password = "password3"

    db.session.add_all([instructor, student1, student2])
    db.session.commit()

    # --- Quizzes ---
    quiz1 = Quiz(
        title="Addition Basics",
        description="Simple adding numbers",
        grade_level="Kindergarten",
        instructor_id=instructor.id
    )
    quiz2 = Quiz(
        title="Subtraction Practice",
        description="Learning how to subtract",
        grade_level="Grade 1",
        instructor_id=instructor.id
    )
    quiz3 = Quiz(
        title="Prepositions Fun",
        description="Using A, An, The correctly",
        grade_level="Grade 2",
        instructor_id=instructor.id
    )

    db.session.add_all([quiz1, quiz2, quiz3])
    db.session.commit()

    # --- Classrooms ---
    classroom1 = Classroom(
        name="KG Math Stars",
        instructor_id=instructor.id
    )
    classroom2 = Classroom(
        name="Grade 1 Wizards",
        instructor_id=instructor.id
    )

    db.session.add_all([classroom1, classroom2])
    db.session.commit()

    # --- Enroll students ---
    classroom1.students.append(student1)
    classroom1.students.append(student2)
    classroom2.students.append(student2)

    db.session.commit()

    print("✅ Seeding completed successfully!")
