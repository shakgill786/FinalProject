// src/components/Dashboard/InstructorDashboard.jsx

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getAllQuizzes, deleteQuizThunk } from "../../redux/quizzes";
import InstructorStudentList from "./InstructorStudentList";
import "./InstructorDashboard.css";

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((st) => st.session.user);
  const quizzes = useSelector((st) => Object.values(st.quizzes));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionUser) return;
    if (sessionUser.role === "instructor") {
      dispatch(getAllQuizzes()).finally(() => setLoading(false));
    }
  }, [dispatch, sessionUser]);

  if (!sessionUser) return null;
  if (loading) return <p>Loading…</p>;

  return (
    <div className="dashboard-container">
      <h1>Instructor Dashboard</h1>

      <div className="dashboard-buttons">
        <Link to="/create">
          <button className="create-quiz-button">➕ Create New Quiz</button>
        </Link>
        <Link to="/dashboard/instructor/classrooms">
          <button className="manage-classrooms-button">🏫 Manage Classrooms</button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p>No quizzes yet. Create one!</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((q) => (
            <div key={q.id} className="quiz-card">
              <h2>{q.title}</h2>
              <p>{q.description}</p>
              <p><strong>Grade:</strong> {q.grade_level || "N/A"}</p>
              <div className="quiz-actions">
                <Link to={`/quizzes/${q.id}`}>
                  <button className="view-quiz-button">📋 View Quiz</button>
                </Link>
                <Link to={`/dashboard/instructor/quizzes/${q.id}/manage-questions`}>
                  <button className="manage-quiz-button">🛠️ Manage</button>
                </Link>
                <Link to={`/dashboard/instructor/quizzes/${q.id}/edit`}>
                  <button className="edit-quiz-button">✏️ Edit Quiz</button>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this quiz?")) {
                      dispatch(deleteQuizThunk(q.id));
                    }
                  }}
                  className="delete-quiz-button"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧑‍🎓 STUDENT LIST + QUIZ HISTORY + FEEDBACK */}
      <div className="student-feedback-section">
        <InstructorStudentList />
      </div>
    </div>
  );
}
