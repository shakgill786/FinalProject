import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./InstructorDashboard.css";

export default function InstructorDashboard() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch("/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  }, []);

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
