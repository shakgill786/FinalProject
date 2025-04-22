// src/components/Quizzes/QuestionCard.jsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import "./QuestionCard.css";

export default function QuestionCard({ question, onDelete }) {
  const { quizId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [questionText, setQuestionText] = useState(question.question_text);
  const [options, setOptions] = useState([...question.options]);
  const [answer, setAnswer] = useState(question.answer);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/quizzes/${quizId}/questions/${question.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: questionText,
        options,
        answer,
      }),
    });

    if (res.ok) {
      setEditMode(false);
    } else {
      const data = await res.json();
      setError(data.error || "Update failed");
    }

    setSaving(false);
  };

  return (
    <div className="question-card">
      {editMode ? (
        <>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="question-input"
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => {
                const updated = [...options];
                updated[i] = e.target.value;
                setOptions(updated);
              }}
              className="option-input"
            />
          ))}
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Correct Answer"
            className="answer-input"
          />
          {error && <p className="error-text">{error}</p>}
          <button onClick={handleUpdate} disabled={saving}>
            ✅ Save
          </button>
          <button onClick={() => setEditMode(false)}>❌ Cancel</button>
        </>
      ) : (
        <>
          <h3>{question.question_text}</h3>
          <ul>
            {question.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>
          <p><strong>Answer:</strong> {question.answer}</p>
          <div className="button-group">
            <button onClick={() => setEditMode(true)}>✏️ Edit</button>
            <button onClick={() => onDelete(question.id)}>🗑 Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
