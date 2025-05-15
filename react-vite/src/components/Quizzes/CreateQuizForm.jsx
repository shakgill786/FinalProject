import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/csrf";
import "./CreateQuizForm.css";

export default function CreateQuizForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch("/api/quizzes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        description,
        grade_level: gradeLevel,
      }),
    });

    if (res.ok) {
      toast.success("✅ Quiz created!");
      navigate("/dashboard/instructor");
    } else {
      try {
        const data = await res.json();
        setErrors(data.errors || [data.error || "Something went wrong"]);
      } catch {
        setErrors(["Unexpected error occurred. Please try again."]);
      }
    }
  };

  return (
    <div className="create-quiz-form">
      <h1>➕ Create a New Quiz</h1>

      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Description
          <textarea
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Grade Level
          <input
            type="text"
            placeholder="e.g. Kindergarten, Grade 1"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />
        </label>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate(-1)}>
            ↩️ Cancel
          </button>
          <button type="submit">💾 Create</button>
        </div>
      </form>
    </div>
  );
}