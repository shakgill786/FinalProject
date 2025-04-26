// react-vite/src/components/Leaderboard/Leaderboard.jsx
import { useEffect, useState } from "react";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("/api/quizzes/leaderboard", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setLeaders(data));
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
    </div>
  );
}
