// react-vite/src/components/NavBar/NavBar.jsx

import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLogout } from "../../redux/session";
import { toast } from "react-toastify";
import "./NavBar.css";

export default function NavBar() {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    await dispatch(thunkLogout());
    toast.info("You’ve been logged out.");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/">KnowBie</Link>
      </h1>

      <div className="nav-links">
        <NavLink to="/" className="nav-item">🧠 Quizzes</NavLink>

        {sessionUser?.role === "instructor" && (
          <NavLink to="/create" className="nav-item">➕ Create Quiz</NavLink>
        )}

        {sessionUser?.role === "instructor" && (
          <NavLink to="/dashboard/instructor" className="nav-item">📊 Dashboard</NavLink>
        )}
        
        {sessionUser?.role === "student" && (
          <NavLink to="/dashboard/student" className="nav-item">🎓 My Dashboard</NavLink>
        )}

        {!sessionUser ? (
          <NavLink to="/login" className="nav-item login-btn">🔐 Log In</NavLink>
        ) : (
          <>
            <span className="nav-item welcome-text">👋 Welcome, {sessionUser.username}!</span>
            <button
              onClick={handleLogout}
              className="nav-item logout-btn"
              style={{
                border: "none",
                background: "transparent",
                color: "#f55",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#c00")}
              onMouseLeave={(e) => (e.target.style.color = "#f55")}
            >
              🚪 Log Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
