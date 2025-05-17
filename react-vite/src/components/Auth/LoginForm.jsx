// src/components/Auth/LoginForm.jsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkLogin } from "../../redux/session";
import { useNavigate, Link } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const res = await dispatch(thunkLogin({ email, password }));

    if (res?.errors || res?.email || res?.password) {
      const err = res.errors || Object.values(res).flat();
      setErrors(err);
    } else {
      navigate(res?.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student");
    }
  };

  const handleDemoLogin = async (type) => {
    setErrors([]);
    const credentials = type === "instructor"
      ? { email: "shak@example.com", password: "password" }
      : { email: "emma@example.com", password: "password" };

    const res = await dispatch(thunkLogin(credentials));

    if (res?.errors) {
      setErrors(res.errors);
    } else {
      navigate(res?.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {errors.map((err, i) => (
            <p className="error" key={i}>{err}</p>
          ))}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="glow-button">
            Log In
          </button>
        </form>

        <div className="demo-buttons">
          <button
            className="glow-button alt"
            onClick={() => handleDemoLogin("instructor")}
          >
            Demo Instructor
          </button>
          <button
            className="glow-button alt"
            onClick={() => handleDemoLogin("student")}
          >
            Demo Student
          </button>
        </div>

        <div className="signup-button-container">
          <p className="signup-prompt">Don’t have an account?</p>
          <Link to="/signup">
            <button className="glow-button alt">Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}