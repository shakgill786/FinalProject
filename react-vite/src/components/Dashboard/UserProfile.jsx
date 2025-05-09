import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import { toast } from "react-toastify";
import "./UserProfile.css";

export default function UserProfile() {
  const sessionUser = useSelector((st) => st.session.user);
  const [quizzes, setQuizzes] = useState([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  // load this instructor's quizzes
  useEffect(() => {
    if (sessionUser?.role === "instructor") {
      fetch("/api/feedback/instructor-quizzes", { credentials: "include" })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => setQuizzes(data))
        .catch(console.error);
    }
  }, [sessionUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    setChanging(true);

    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });

    setChanging(false);
    if (res.ok) {
      toast.success("Password updated!");
      setOldPassword("");
      setNewPassword("");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update password");
    }
  };

  if (!sessionUser) return null;

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="profile-container">
      <h1>👤 My Profile</h1>

      <div className="profile-section">
        <p><strong>Username:</strong> {cap(sessionUser.username)}</p>
        <p><strong>Email:</strong> {sessionUser.email}</p>
        <p><strong>Role:</strong> {cap(sessionUser.role)}</p>
      </div>

      <form className="password-section" onSubmit={handlePasswordChange}>
        <h2>🔒 Change Password</h2>
        <input
          type="password"
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={changing}>
          {changing ? "Updating…" : "Update Password"}
        </button>
      </form>

      {sessionUser.role === "instructor" && (
        <div className="quizzes-section">
          <h2>📝 My Quizzes</h2>
          {quizzes.length ? (
            <ul>
              {quizzes.map((q) => (
                <li key={q.id}>
                  <Link to={`/dashboard/instructor/quizzes/${q.id}/manage-questions`} className="quiz-link">
                    {q.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quizzes created yet.</p>
          )}
        </div>
      )}
    </div>
  );
}