// src/components/NavBar/NavBar.jsx
import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="navbar">
      <h1 className="logo">KidGenius</h1>
      <div className="nav-links">
        <NavLink to="/" className="nav-item">🧠 Quizzes</NavLink>
        <NavLink to="/create" className="nav-item">➕ Create Quiz</NavLink>
      </div>
    </nav>
  );
}
