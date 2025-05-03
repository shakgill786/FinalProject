import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const sessionUser = useSelector((state) => state.session.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/quizzes/history", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, [refreshKey]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshHistory();
      }
    };

    const interval = setInterval(refreshHistory, 60000); // Refresh every 60s
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const refreshHistory = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const totalPoints = history.reduce((sum, q) => sum + q.points, 0);
  const average = history.length
    ? Math.round(history.reduce((s, q) => s + q.score, 0) / history.length)
    : 0;
  const best = history.reduce((max, q) => (q.score > max.score ? q : max), {
    score: 0,
    title: "N/A",
  });

  if (!sessionUser || sessionUser.role !== "student") return null;

  return (
    <div className="student-dashboard">
      <h1>🎓 Welcome back, {sessionUser.username}!</h1>

      <button className="leaderboard-btn" onClick={() => navigate("/leaderboard")}>
        🧠 View Leaderboard
      </button>

      <button className="refresh-btn" onClick={refreshHistory}>
        🔄 Refresh Dashboard
      </button>

      {loading ? (
        <p>Loading your quiz history...</p>
      ) : (
        <>
          <section className="quiz-history">
            <h2>📚 My Quizzes</h2>
            {history.length === 0 ? (
              <p>You haven’t completed any quizzes yet.</p>
            ) : (
              <ul>
                {history.map((quiz, idx) => (
                  <li key={idx} className="quiz-entry">
                    <strong>{quiz.title}</strong> - Score: {quiz.score}% - Taken on {quiz.date} - Points: {quiz.points}
                    {quiz.badges?.length > 0 && (
                      <div className="badges">
                        {quiz.badges.map((badge, i) => (
                          <span className="badge" key={i}>{badge}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="retake-btn"
                      onClick={() => {
                        navigate(`/quizzes/${quiz.id}`);
                      }}
                    >
                      🔁 Retake
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="badges">
            <h2>🏅 Badges & Achievements</h2>
            {history.length >= 1 && <p>⭐ First quiz completed</p>}
            {history.find((q) => q.score === 100) && <p>🏆 100% score badge</p>}
            {history.length >= 5 && <p>🔥 5 quizzes finished</p>}
            <p>💡 Accuracy Ace = Score 100%</p>
            <p>⚡ Fast Thinker = Avg. Points ≥ 70%</p>
          </section>

          <section className="performance-summary">
            <h2>📊 Performance Summary</h2>
            <p>Average Score: {average}%</p>
            <p>Best Quiz: “{best.title}”</p>
            <p>Total Points: {totalPoints}</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${Math.min(totalPoints, 100)}%` }}></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}