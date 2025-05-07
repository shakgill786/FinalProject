// src/components/Auth/SignUpForm.jsx

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { thunkSignup } from "../../redux/session";

export default function SignUpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await dispatch(thunkSignup({ username, email, password, role }));

    if (res?.errors || res?.email || res?.password) {
      const err = res.errors || Object.values(res).flat();
      setErrors(err);
    } else {
      navigate(role === "instructor" ? "/dashboard/instructor" : "/dashboard/student");
    }
  };

  return (
    <div className="signup-form-wrapper">
      <h2>📝 Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {errors.map((err, i) => (
          <p key={i} className="error">{err}</p>
        ))}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">🎓 Student</option>
          <option value="instructor">👩‍🏫 Instructor</option>
        </select>
        <button type="submit">✅ Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in here</Link> 🔑</p>
    </div>
  );
}