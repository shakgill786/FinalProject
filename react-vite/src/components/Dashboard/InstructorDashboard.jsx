import React, { useEffect, useState } from "react";
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

  // Modal state for deleting a quiz
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [deleteQuizTitle, setDeleteQuizTitle] = useState("");

  useEffect(() => {
    if (sessionUser?.role === "instructor") {
      dispatch(getAllQuizzes()).finally(() => setLoading(false));
    }
  }, [dispatch, sessionUser]);

  if (!sessionUser) return null;
  if (loading) return <p className="loading-text">Loading…</p>;

  const openDeleteModal = (quiz) => {
    setDeleteQuizId(quiz.id);
    setDeleteQuizTitle(quiz.title);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteQuizId) {
      dispatch(deleteQuizThunk(deleteQuizId));
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteQuizId(null);
    setDeleteQuizTitle("");
  };

  return (
    <div className="dashboard-container glass-panel">
      <h1>📚 Instructor Dashboard</h1>

      <div className="dashboard-buttons">
        <Link to="/create">
          <button className="create-quiz-button">➕ Create New Quiz</button>
        </Link>
        <Link to="/dashboard/instructor/classrooms">
          <button className="manage-classrooms-button">🏫 Manage Classrooms</button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="no-quizzes-text">No quizzes yet. Create one!</p>
      ) : (
        <div className="quiz-list">
          {quizzes.map((q) => (
            <div key={q.id} className="quiz-card">
              <h2>{q.title}</h2>
              <p>{q.description}</p>
              <p>
                <strong>Grade:</strong> {q.grade_level || "N/A"}
              </p>
              <div className="quiz-actions">
                <Link to={`/quizzes/${q.id}`}>
                  <button className="view-quiz-button">📋 View</button>
                </Link>
                <Link to={`/dashboard/instructor/quizzes/${q.id}/manage-questions`}>
                  <button className="manage-quiz-button">🛠️ Manage</button>
                </Link>
                <Link to={`/dashboard/instructor/quizzes/${q.id}/edit`}>
                  <button className="edit-quiz-button">✏️ Edit</button>
                </Link>
                <button
                  className="delete-quiz-button"
                  onClick={() => openDeleteModal(q)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="student-feedback-section">
        <InstructorStudentList />
      </div>

      {showDeleteModal && (
        <div className="confirm-modal-overlay" onClick={closeDeleteModal}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Delete Quiz?</h3>
            <p>
              Are you sure you want to delete the quiz{" "}
              <strong>“{deleteQuizTitle}”</strong>?
            </p>
            <div className="confirm-modal-buttons">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                ❌ Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDelete}>
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}