// react-vite/src/components/Quizzes/QuizList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../../assets/CuteBear.json";
import "./QuizList.css";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/quizzes/", {
        credentials: "include",
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

  return (
    <div className="quiz-list-hero">
      {/* Hero with Lottie Animation */}
      <div className="hero-banner">
        <div className="hero-animation">
          <Lottie animationData={animationData} loop autoplay />
        </div>
        <div className="hero-text">
          <h1 className="hero-title">Welcome to KnowBie</h1>
          <p className="hero-subtitle">Learn. Play. Conquer. 🧠</p>
        </div>
      </div>

      {/* Quiz list */}
      {loading ? (
        <p className="loading-text">Loading quizzes...</p>
      ) : quizzes.length === 0 ? (
        <p className="no-quizzes">No quizzes yet!</p>
      ) : (
        <div className="quiz-card-grid">
          {quizzes.map((quiz) => (
            <div className="quiz-card" key={quiz.id}>
              <h3>{quiz.title}</h3>
              <p className="quiz-meta">{quiz.grade_level}</p>
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
      )}
    </div>
  );
}