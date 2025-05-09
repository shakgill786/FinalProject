import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { thunkLoadFeedback } from "../../redux/feedback";
import FeedbackSection from "./FeedbackSection";
import GiveFeedbackForm from "../Quizzes/GiveFeedbackForm";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const sessionUser = useSelector((st) => st.session.user);
  const dispatch    = useDispatch();
  const navigate    = useNavigate();

  const [assigned, setAssigned]     = useState([]);
  const [history, setHistory]       = useState([]);
  const [loadingAssign, setLoadingAssign] = useState(true);
  const [loadingHist, setLoadingHist]     = useState(true);
  const [refreshKey, setRefreshKey]       = useState(0);
  const [showOlder, setShowOlder]         = useState(false);

  // → load "assigned" quizzes
  useEffect(() => {
    setLoadingAssign(true);
    fetch("/api/quizzes/", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAssigned(data))
      .finally(() => setLoadingAssign(false));
  }, [refreshKey]);

  // → load history + feedback
  useEffect(() => {
    setLoadingHist(true);
    fetch("/api/quizzes/history", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setHistory(data);
        if (sessionUser?.id) dispatch(thunkLoadFeedback(sessionUser.id));
      })
      .finally(() => setLoadingHist(false));
  }, [dispatch, sessionUser?.id, refreshKey]);

  const refreshAll = () => setRefreshKey((k) => k + 1);

  // stats
  const totalPoints = history.reduce((sum, q) => sum + q.points, 0);
  const average     = history.length
    ? Math.round(history.reduce((s, q) => s + q.score, 0) / history.length)
    : 0;
  const best = history.reduce(
    (m, q) => (q.score > m.score ? q : m),
    { score: 0, title: "N/A" }
  );

  const recent = history.slice(0, 5);
  const older  = history.slice(5);

  if (!sessionUser) return null;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="student-dashboard">
      {/* ─── Header ────────────────────────────────────── */}
      <header className="sd-header">
        <h1>🎓 Welcome back, {cap(sessionUser.username)}!</h1>
        <button
          className="leaderboard-btn"
          onClick={() => navigate("/leaderboard")}
        >
          🧠 View Leaderboard
        </button>
      </header>

      {/* ─── General (free-form) Feedback ───────────────── */}
      <section className="general-feedback">
        <h2>🗣️ General Feedback</h2>
        <FeedbackSection studentId={sessionUser.id} quizId={null} />
      </section>

      {/* ─── Assigned Quizzes ──────────────────────────── */}
      <section className="assigned-section">
        <h2>📝 Assigned Quizzes</h2>
        {loadingAssign ? (
          <p>Loading quizzes…</p>
        ) : assigned.length === 0 ? (
          <p>No quizzes assigned.</p>
        ) : (
          <div className="quiz-grid">
            {assigned.map((q) => (
              <div key={q.id} className="quiz-card card-assigned">
                <h3>{q.title}</h3>
                <p className="grade">{q.grade_level}</p>
                <p className="description">{q.description}</p>
                <button onClick={() => navigate(`/quizzes/${q.id}`)}>
                  🚀 Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Completed Quizzes ─────────────────────────── */}
      <section className="completed-section">
        <div className="completed-header">
          <h2>✅ Completed Quizzes</h2>
          <button className="refresh-btn" onClick={refreshAll}>
            🔄 Refresh
          </button>
        </div>
        {loadingHist ? (
          <p>Loading history…</p>
        ) : history.length === 0 ? (
          <p>No completed quizzes yet.</p>
        ) : (
          <>
            <div className="quiz-grid">
              {recent.map((q) => (
                <div key={`${q.id}-${q.date}`} className="quiz-card card-completed">
                  <h3>{q.title}</h3>
                  <div className="quiz-stats">
                    <span>Score: {q.score}%</span>
                    <span>Points: {q.points}</span>
                    <span>Date: {q.date}</span>
                  </div>
                  {q.badges?.length > 0 && (
                    <div className="badges">
                      {q.badges.map((b,i) => (
                        <span key={i} className="badge">{b}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => navigate(`/quizzes/${q.id}`)}>
                    🔁 Retake
                  </button>
                  <FeedbackSection studentId={sessionUser.id} quizId={q.id} />
                  {sessionUser.role === "instructor" && (
                    <GiveFeedbackForm
                      studentId={sessionUser.id}
                      quizId={q.id}
                      onSuccess={refreshAll}
                    />
                  )}
                </div>
              ))}
            </div>

            {older.length > 0 && (
              <>
                <button
                  className="toggle-older-btn"
                  onClick={() => setShowOlder((o) => !o)}
                >
                  {showOlder ? "🔽 Hide Older" : "🔼 Show Older"}
                </button>
                {showOlder && (
                  <div className="quiz-grid older-grid">
                    {older.map((q) => (
                      <div
                        key={`${q.id}-${q.date}`}
                        className="quiz-card card-completed faded"
                      >
                        <h3>{q.title}</h3>
                        <div className="quiz-stats">
                          <span>Score: {q.score}%</span>
                          <span>Points: {q.points}</span>
                          <span>Date: {q.date}</span>
                        </div>
                        <button onClick={() => navigate(`/quizzes/${q.id}`)}>
                          🔁 Retake
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* ─── Performance Summary ───────────────────────── */}
      {history.length > 0 && (
        <section className="card summary-card">
          <h2>📊 Performance Summary</h2>
          <p>Average Score: {average}%</p>
          <p>Best Quiz: “{best.title}”</p>
          <p>Total Points: {totalPoints}</p>
        </section>
      )}
    </div>
);
}