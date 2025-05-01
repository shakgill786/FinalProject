// react-vite/src/components/Quizzes/CreateQuizForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./CreateQuizForm.css";

export default function CreateQuizForm() {
  const navigate = useNavigate();
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [errors, setErrors]         = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // ensure fresh CSRF
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch("/api/quizzes/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken":   getCookie("csrf_token"),
      },
      body: JSON.stringify({
        title:       title.trim(),
        description: description.trim(),
        grade_level: gradeLevel.trim(),
      }),
    });

    if (res.ok) {
      navigate("/dashboard/instructor");
    } else {
      const data = await res.json();
      setErrors(data.errors || ["Something went wrong"]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-quiz-form">
      <h2>Create a New Quiz</h2>
      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Grade Level"
        value={gradeLevel}
        onChange={(e) => setGradeLevel(e.target.value)}
      />
      <button type="submit">Create Quiz</button>
    </form>
  );
}
