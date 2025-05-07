// src/components/NavBar/NavBar.jsx

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
    if (!window.confirm("Are you sure you want to log out?")) return;
    await dispatch(thunkLogout());
    toast.info("You’ve been logged out.");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src="/KnowBie.png" alt="KnowBie Logo" className="icon-logo" />
        </Link>
      </div>

      <div className="navbar-center">
        <img src="/KnowBieText.png" alt="KnowBie Text" className="text-logo" />
      </div>

      <div className="navbar-right">
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
            <span className="nav-item welcome-text">👋 {sessionUser.username}</span>
            <button onClick={handleLogout} className="nav-item logout-btn">🚪 Log Out</button>
          </>
        )}
      </div>
    </nav>
  );
}