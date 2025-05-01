// react-vite/src/components/Quizzes/EditQuizForm.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./EditQuizForm.css";

export default function EditQuizForm() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [errors, setErrors] = useState([]);

  // 1️⃣ Load existing quiz
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description || "");
        setGradeLevel(data.grade_level || "");
      } else {
        toast.error("❌ Could not load quiz data");
      }
    })();
  }, [quizId]);

  // 2️⃣ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const res = await fetch(`/api/quizzes/${quizId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, grade_level: gradeLevel }),
    });

    if (res.ok) {
      toast.success("✅ Quiz updated!");
      navigate("/dashboard/instructor");
    } else {
      const data = await res.json();
      setErrors(data.errors || [data.error || "Unknown error"]);
    }
  };

  return (
    <div className="edit-quiz-form">
      <h1>✏️ Edit Quiz</h1>

      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Grade Level
          <input
            type="text"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />
        </label>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate(-1)}>
            ↩️ Cancel
          </button>
          <button type="submit">💾 Save</button>
        </div>
      </form>
    </div>
  );
}
