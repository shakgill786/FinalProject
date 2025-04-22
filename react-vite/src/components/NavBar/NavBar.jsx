// src/components/NavBar/NavBar.jsx
import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./NavBar.css";

export default function NavBar() {
  const sessionUser = useSelector((state) => state.session.user);
  console.log("👀 sessionUser:", sessionUser);

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/">KidGenius</Link>
      </h1>

      <div className="nav-links">
        <NavLink to="/" className="nav-item">🧠 Quizzes</NavLink>
        <NavLink to="/create" className="nav-item">➕ Create Quiz</NavLink>

        {!sessionUser ? (
          <NavLink to="/login" className="nav-item login-btn">🔐 Log In</NavLink>
        ) : (
          <span className="nav-item welcome-text">👋 Welcome, {sessionUser.username}!</span>
        )}
      </div>
    </nav>
  );
}
