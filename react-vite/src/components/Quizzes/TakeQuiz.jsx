import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./TakeQuiz.css";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timestamps, setTimestamps] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [quizDone, setQuizDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/quizzes/${quizId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setStartTime(Date.now()); // Start timer for the first question
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [quizId]);

  const handleAnswer = (option) => {
    const isCorrect = option === questions[currentQ].answer;
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 500);
    }

    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    setTimestamps((prev) => [...prev, elapsedSeconds]);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setStartTime(Date.now()); // Restart timer for next question
      } else {
        setQuizDone(true);
        submitAttempt(isCorrect ? correct + 1 : correct);
      }
    }, 700);
  };

  const submitAttempt = async (finalCorrect) => {
    const score = Math.round((finalCorrect / questions.length) * 100);
    console.log({ score, timestamps });

    // 🔐 Ensure CSRF token is valid
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ score, timestamps }),
    });

    if (res.ok) {
      console.log("✅ Attempt submitted");
    } else {
      const err = await res.json();
      console.error("❌ Failed to submit attempt:", err);
    }
  };

  if (loading) return <p>Loading questions...</p>;

  if (!questions.length) {
    return (
      <div className="quiz-play-container">
        <h2>🎯 Quiz #{quizId}</h2>
        <p>No questions for this quiz yet!</p>
        <Link to={`/quizzes/${quizId}/add-question`} className="add-question-btn">
          ➕ Add Question
        </Link>
      </div>
    );
  }

  if (quizDone) {
    const finalScore = Math.round((correct / questions.length) * 100);

    return (
      <div className="quiz-complete-container">
        <h2>{finalScore === 100 ? "🎉 Perfect Score!" : "✅ Quiz Complete!"}</h2>
        {finalScore === 100 && (
          <img src="/celebrate.gif" alt="Celebration" />
        )}
        <p>
          You got {correct} out of {questions.length} questions right ({finalScore}%)
        </p>
        <button onClick={() => navigate("/")}>Back to Quizzes</button>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="quiz-play-container">
      <h2>🎯 Quiz #{quizId}</h2>
      <h3>{question.question_text}</h3>
      <div className="options">
        {question.options.map((opt, idx) => (
          <button key={idx} onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {showConfetti && <div className="confetti">🎉</div>}
    </div>
  );
}