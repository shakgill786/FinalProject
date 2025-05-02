// react-vite/src/components/Dashboard/Leaderboard.jsx

import { useEffect, useState } from "react";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch("/api/quizzes/leaderboard", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLeaders(data));

    fetch("/api/quizzes/me/points", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMe(data));
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>🏆 Leaderboard</h1>

      {leaders.length === 0 ? (
        <p>No data available yet.</p>
      ) : (
        <ol className="leaderboard-list">
          {leaders.map((user, index) => (
            <li key={user.user_id}>
              <span className="rank">#{index + 1}</span>
              <span className="name">{user.username}</span>
              <span className="points">{user.total_points} pts</span>
            </li>
          ))}
        </ol>
      )}

      {me && (
        <div className="your-rank-card">
          <h2>👋 Your Stats</h2>
          <p>Username: <strong>{me.username}</strong></p>
          <p>Total Points: <strong>{me.total_points} pts</strong></p>
        </div>
      )}
    </div>
  );
}