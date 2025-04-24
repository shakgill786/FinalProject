import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const sessionUser = useSelector((state) => state.session.user);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/quizzes/history", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  if (!sessionUser || sessionUser.role !== "student") return null;

  return (
    <div className="student-dashboard">
      <h1>🎓 Welcome back, {sessionUser.username}!</h1>

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
                    <strong>{quiz.title}</strong> - Score: {quiz.score}% - Taken on {quiz.date}
                    <button
                      className="retake-btn"
                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
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
            <p>⭐ First quiz completed</p>
            <p>🏆 100% score badge</p>
            <p>🔥 5 quizzes finished</p>
          </section>

          <section className="performance-summary">
            <h2>📊 Performance Summary</h2>
            <p>Average Score: 82%</p>
            <p>Best Quiz: “Fractions 101”</p>
            <p>Correct Answers: 37</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: "70%" }}></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
