import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thunkLogout } from "../../redux/session";
import { toast } from "react-toastify";
import "./NavBar.css";

export default function NavBar() {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  const confirmLogout = async () => {
    await dispatch(thunkLogout());
    toast.info("You’ve been logged out.");
    closeLogoutModal();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo-icon">
          <img src="/KnowBie.png" alt="KnowBie icon" />
        </Link>

        <div className="navbar-logo-text">
          <Link to="/">
            <img src="/KnowBieText.png" alt="KnowBie" />
          </Link>
        </div>

        <div className="nav-links">
          <NavLink to="/" className="nav-item">🧠 Quizzes</NavLink>

          {sessionUser?.role === "instructor" && (
            <>
              <NavLink to="/create" className="nav-item">➕ Create Quiz</NavLink>
              <NavLink to="/dashboard/instructor" className="nav-item">📊 Dashboard</NavLink>
            </>
          )}

          {sessionUser?.role === "student" && (
            <NavLink to="/dashboard/student" className="nav-item">🎓 My Dashboard</NavLink>
          )}

          {!sessionUser ? (
            <NavLink to="/login" className="nav-item login-btn">🔐 Log In</NavLink>
          ) : (
            <>
              <span className="nav-item welcome-text">👋 {sessionUser.username}</span>
              <button
                onClick={openLogoutModal}
                className="nav-item logout-btn"
              >
                🚪 Log Out
              </button>
            </>
          )}
        </div>
      </nav>

      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={closeLogoutModal}>
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>🚪 Confirm Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeLogoutModal}
              >
                ❌ Cancel
              </button>
              <button
                type="button"
                className="confirm-btn"
                onClick={confirmLogout}
              >
                ✅ Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}