import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./TakeQuiz.css";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [pointsEarned, setPointsEarned] = useState([]); // 💥 NEW: store live points
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
        setStartTime(Date.now());
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [quizId]);

  const handleAnswer = (option) => {
    const isCorrect = option === questions[currentQ].answer;
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    const points = isCorrect
      ? elapsedSeconds <= 2
        ? 10
        : elapsedSeconds <= 5
        ? 5
        : 2
      : 0;

    setTimestamps((prev) => [...prev, elapsedSeconds]);
    setPointsEarned((prev) => [...prev, points]);

    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 500);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setStartTime(Date.now());
      } else {
        setQuizDone(true);
        submitAttempt(isCorrect ? correct + 1 : correct, [...pointsEarned, points]);
      }
    }, 700);
  };

  const submitAttempt = async (finalCorrect, finalPointsArray) => {
    const score = Math.round((finalCorrect / questions.length) * 100);
    const totalPoints = finalPointsArray.reduce((a, b) => a + b, 0);
    console.log({ score, timestamps });

    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ score, timestamps, points: finalPointsArray }),
    });

    if (res.ok) {
      console.log("✅ Attempt submitted");
      setTimeout(() => navigate("/leaderboard"), 4000);
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
    const totalPoints = pointsEarned.reduce((a, b) => a + b, 0);
    const avgTime = timestamps.reduce((sum, t) => sum + t, 0) / timestamps.length;

    const earnedBadges = [];
    if (finalScore === 100) earnedBadges.push("🧠 Accuracy Ace");
    if (avgTime <= 2) earnedBadges.push("⚡ Fast Thinker");

    return (
      <div className="quiz-complete-container">
        <h2>{finalScore === 100 ? "🎉 Perfect Score!" : "✅ Quiz Complete!"}</h2>
        {finalScore === 100 && <img src="/celebrate.gif" alt="Celebration" />}
        <p>
          You got {correct} out of {questions.length} questions right ({finalScore}%)
        </p>
        <p>🟢 Total Points Earned: {totalPoints}</p>

        {earnedBadges.length > 0 ? (
          <div className="earned-badges">
            <h3>🏅 You Earned:</h3>
            <ul>
              {earnedBadges.map((badge, i) => (
                <li key={i}>{badge}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No badges earned this time. Keep trying! 💪</p>
        )}

        <div className="badge-info">
          <h4>📜 Badge Criteria</h4>
          <ul>
            <li>🧠 Accuracy Ace: Score 100% on a quiz</li>
            <li>⚡ Fast Thinker: Average time per question ≤ 2 seconds</li>
          </ul>
        </div>

        <p>🏁 Redirecting to leaderboard...</p>
      </div>
    );
  }

  const question = questions[currentQ];
  const latestPoints = pointsEarned[pointsEarned.length - 1];

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
      {latestPoints !== undefined && (
        <p className="live-points">🟢 Points for last answer: {latestPoints}</p>
      )}
      {showConfetti && <div className="confetti">🎉</div>}
    </div>
  );
}
