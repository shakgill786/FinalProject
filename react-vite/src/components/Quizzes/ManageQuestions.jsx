// react-vite/src/components/Quizzes/ManageQuestions.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./ManageQuestions.css";

export default function ManageQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState([]);

  const fetchQuestions = async () => {
    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      credentials: "include",
    });
    if (res.ok) setQuestions(await res.json());
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const addOption = () => setOptions([...options, ""]);

  const changeOption = (i, val) => {
    const o = [...options];
    o[i] = val;
    setOptions(o);
  };

  const handleCreate = async () => {
    setErrors([]);
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      body: JSON.stringify({
        question_text: newQ.trim(),
        options,
        answer: answer.trim(),
      }),
    });

    if (res.ok) {
      setNewQ("");
      setOptions(["", ""]);
      setAnswer("");
      fetchQuestions();
    } else {
      const data = await res.json();
      setErrors(data.errors || ["Something went wrong"]);
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm("Delete this question?")) return;
    await fetch(`/api/quizzes/${quizId}/questions/${qId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrf_token") },
    });
    fetchQuestions();
  };

  return (
    <div className="manage-questions-container">
      <h2>Manage Questions for Quiz #{quizId}</h2>

      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      <div className="new-question-form">
        <textarea
          placeholder="Enter your question..."
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
        />

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => changeOption(i, e.target.value)}
          />
        ))}

        <button className="add-option" onClick={addOption}>
          ➕ Add Option
        </button>

        <input
          placeholder="Correct Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button className="create-btn" onClick={handleCreate}>
          ✅ Create Question
        </button>
      </div>

      <ul className="question-list">
        {questions.map((q) => (
          <li key={q.id} className="question-card">
            <strong>{q.question_text}</strong>
            <ul className="options-list">
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
            <p className="answer">
              <em>Answer: {q.answer}</em>
            </p>
            <button className="delete-btn" onClick={() => handleDelete(q.id)}>
              🗑️ Delete
            </button>
          </li>
        ))}
      </ul>

      <button className="done-btn" onClick={() => navigate("/dashboard/instructor")}>
        ✅ Done
      </button>
    </div>
  );
}