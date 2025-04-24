// react-vite/src/components/Auth/LoginForm.jsx

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

    const res = await dispatch(thunkLogin({ email, password }));

    if (res?.errors || res?.email || res?.password) {
      const err = res.errors || Object.values(res).flat();
      setErrors(err);
    } else {
      toast.success(`Welcome back, ${res.username}!`);

      if (res?.role === "instructor") {
        navigate("/dashboard/instructor");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="login-form-wrapper">
      <h2>Login</h2>
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
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
