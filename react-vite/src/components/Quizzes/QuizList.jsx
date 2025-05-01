import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizList.css";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/quizzes/", {
        credentials: "include",        // ← include the session cookie
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        console.error("Failed to load quizzes:", res.status);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading quizzes...</p>;

  return (
    <div className="quiz-list-container">
      <h2>🧠 Available Quizzes</h2>
      {quizzes.length === 0 && <p>No quizzes yet!</p>}
      <div className="quiz-card-grid">
        {quizzes.map((quiz) => (
          <div className="quiz-card" key={quiz.id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.grade_level}</p>
            <p>{quiz.description}</p>
            <button
              className="view-btn"
              onClick={() => navigate(`/quizzes/${quiz.id}`)}
            >
              Start Quiz 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
