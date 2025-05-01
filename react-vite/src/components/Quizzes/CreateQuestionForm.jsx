import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./CreateQuizForm.css"; // Reuse styles

export default function CreateQuestionForm() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState([]);

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (i, val) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({
        question_text: questionText.trim(),
        options,
        answer: answer.trim(),
      }),
    });

    if (res.ok) {
      navigate(`/dashboard/instructor/quizzes/${quizId}/manage-questions`);
    } else {
      const data = await res.json();
      setErrors(data.errors || ["Something went wrong"]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-quiz-form">
      <h2>➕ Add New Question</h2>
      {errors.length > 0 && (
        <ul className="form-errors">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <textarea
        placeholder="Question Text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        required
      />
      {options.map((opt, i) => (
        <input
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => updateOption(i, e.target.value)}
          required
        />
      ))}
      <button type="button" onClick={addOption}>➕ Add Option</button>
      <input
        placeholder="Correct Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />
      <button type="submit">Create Question</button>
    </form>
  );
}
