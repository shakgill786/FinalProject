import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import "./ManageQuestions.css";

export default function ManageQuestions() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, [quizId]);

  const handleDelete = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    const res = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  };

  const handleUpdate = async (questionId, updatedData) => {
    const res = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      const updatedQuestion = await res.json();
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? updatedQuestion : q))
      );
    }
  };

  return (
    <div className="manage-questions-container">
      <h2>🧩 Manage Questions</h2>
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
