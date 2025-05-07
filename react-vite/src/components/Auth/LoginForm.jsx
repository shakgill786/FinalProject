// src/components/Auth/LoginForm.jsx

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { thunkLogin } from "../../redux/session";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await dispatch(thunkLogin({ email, password }));

    if (res?.errors || res?.email || res?.password) {
      const err = res.errors || Object.values(res).flat();
      setErrors(err);
    } else {
      navigate(res?.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student");
    }
  };

  return (
    <div className="login-form-wrapper">
      <h2>🔐 Log In</h2>
      <form onSubmit={handleSubmit}>
        {errors.map((err, i) => (
          <p key={i} className="error">{err}</p>
        ))}
        <input
          type="text"
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
        <button type="submit">✅ Log In</button>
      </form>
      <p>Don’t have an account? <Link to="/signup">Sign up here</Link> 💡</p>
    </div>
  );
}