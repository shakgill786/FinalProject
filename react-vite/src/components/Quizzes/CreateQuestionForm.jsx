import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateQuestionForm.css";

export default function CreateQuestionForm() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [answer, setAnswer] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState([]);

  const questionInputRef = useRef(null);

  useEffect(() => {
    questionInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: questionText,
        options,
        answer,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setQuestionText("");
      setOptions(["", "", ""]);
      setAnswer("");

      setTimeout(() => {
        navigate(`/quizzes/${quizId}`); // Go back to quiz after short delay
      }, 1000);
    } else {
      const data = await res.json();
      setErrors(data.errors || ["Something went wrong."]);
    }
  };

  return (
    <div className="drawer-form">
      <h2>➕ Add a Question</h2>
      {success && <p className="success-msg">✅ Question added!</p>}
      {errors.length > 0 && <ul className="error-list">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
      <form onSubmit={handleSubmit}>
        <input
          ref={questionInputRef}
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Question text"
          required
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
            onChange={(e) => {
              const updated = [...options];
              updated[idx] = e.target.value;
              setOptions(updated);
            }}
            placeholder={`Option ${idx + 1}`}
            required
          />
        ))}
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Correct answer"
          required
        />
        <button type="submit">✅ Save Question</button>
      </form>
    </div>
  );
}
