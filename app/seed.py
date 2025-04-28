# 📄 app/seed.py

from app.models import db, User, Quiz, Classroom
from app import create_app

def seed_all():
    app = create_app()
    app.app_context().push()

    # Delete everything first
    db.session.execute('DELETE FROM users;')
    db.session.execute('DELETE FROM quizzes;')
    db.session.execute('DELETE FROM classrooms;')
    db.session.commit()

    # ➡️ Create Users
    instructor = User(
        username="shak",
        email="shak@example.com",
        role="instructor",
    )
    instructor.password = "password"

    student1 = User(
        username="emma",
        email="emma@example.com",
        role="student",
    )
    student1.password = "password"

    student2 = User(
        username="sehrish",
        email="sehrish@example.com",
        role="student",
    )
    student2.password = "password"

    db.session.add_all([instructor, student1, student2])
    db.session.commit()

    # ➡️ Create Quizzes
    quiz1 = Quiz(
        title="Math Basics",
        description="Learn simple addition and subtraction!",
        grade_level="1st",
        instructor_id=instructor.id
    )
    quiz2 = Quiz(
        title="Science Fun",
        description="Easy intro to science facts!",
        grade_level="2nd",
        instructor_id=instructor.id
    )

    db.session.add_all([quiz1, quiz2])
    db.session.commit()

    # ➡️ Create a Classroom
    classroom = Classroom(
        name="Math Stars",
        instructor_id=instructor.id
    )
    db.session.add(classroom)
    db.session.commit()

    print("✅ Seeded users, quizzes, and classroom successfully!")

if __name__ == "__main__":
    seed_all()
