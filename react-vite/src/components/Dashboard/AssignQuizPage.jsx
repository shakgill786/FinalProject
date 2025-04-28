// src/components/Dashboard/AssignQuizPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AssignQuizPage.css";

export default function AssignQuizPage() {
  const { classroomId } = useParams();
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [assignedQuizIds, setAssignedQuizIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchAssignedQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const res = await fetch("/api/quizzes", { credentials: "include" });
    if (res.ok) {
      const quizzes = await res.json();
      setAllQuizzes(quizzes);
    }
  };

  const fetchAssignedQuizzes = async () => {
    const res = await fetch(`/api/classrooms/${classroomId}/assigned-quizzes`, {
      credentials: "include",
    });
    if (res.ok) {
      const quizzes = await res.json();
      const ids = quizzes.map((quiz) => quiz.id);
      setAssignedQuizIds(new Set(ids));
    }
    setLoading(false);
  };

  const handleAssign = async (quizId) => {
    const res = await fetch(`/api/classrooms/${classroomId}/assign-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quiz_id: quizId }),
    });
    if (res.ok) {
      toast.success("🎯 Quiz assigned!");
      setAssignedQuizIds((prev) => new Set(prev).add(quizId));
    } else {
      toast.error("❌ Failed to assign quiz.");
    }
  };

  if (loading) return <p>Loading quizzes...</p>;

  return (
    <div className="assign-quiz-page">
      <h1>📝 Assign Quizzes</h1>

      <button
        className="back-button"
        onClick={() => navigate("/dashboard/instructor/classrooms")}
      >
        🔙 Back to Classrooms
      </button>

      {allQuizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <div className="quiz-list">
          {allQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <button
                disabled={assignedQuizIds.has(quiz.id)}
                onClick={() => handleAssign(quiz.id)}
                className="assign-btn"
              >
                {assignedQuizIds.has(quiz.id) ? "✅ Assigned" : "➕ Assign Quiz"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
