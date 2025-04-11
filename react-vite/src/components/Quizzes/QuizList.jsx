import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizList.css";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data);
      setLoading(false);
    };
    fetchQuizzes();
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
            <span className="badge bounce">🎖 Ready to Learn</span>
            <img
              src="/badges/gold-star.png"
              alt="badge"
              className="badge-img spin"
            />
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
