import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getAllQuizzes, deleteQuizThunk } from "../../redux/quizzes";
import "./InstructorDashboard.css";

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => Object.values(state.quizzes));

  useEffect(() => {
    dispatch(getAllQuizzes());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    await dispatch(deleteQuizThunk(id));
  };

  return (
    <div className="dashboard-container">
      <h1>Instructor Dashboard</h1>
      <Link to="/create">
        <button className="create-quiz-button">➕ Create New Quiz</button>
      </Link>

      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
            <p><strong>Grade:</strong> {quiz.grade_level || "N/A"}</p>

            <div className="quiz-actions">
              <Link to={`/quizzes/${quiz.id}`}>
                <button className="view-quiz-button">📋 View Quiz</button>
              </Link>
              <Link to={`/dashboard/instructor/quizzes/${quiz.id}/manage-questions`}>
                <button className="manage-quiz-button">🛠️ Manage</button>
              </Link>
              <button
                onClick={() => handleDelete(quiz.id)}
                className="delete-quiz-button"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
