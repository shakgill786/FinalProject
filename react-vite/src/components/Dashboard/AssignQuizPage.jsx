// react-vite/src/components/Dashboard/AssignQuizPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/csrf";
import "./AssignQuizPage.css";

export default function AssignQuizPage() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [classAssignedQuizIds, setClassAssignedQuizIds] = useState(new Set());
  const [studentAssignments, setStudentAssignments] = useState({});
  const [studentNamesByQuiz, setStudentNamesByQuiz] = useState({});
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchQuizzes(), fetchStudents(), fetchAssignments()]);
    setLoading(false);
  };

  const fetchQuizzes = async () => {
    const res = await fetch("/api/quizzes/", { credentials: "include" });
    if (res.ok) setAllQuizzes(await res.json());
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/users/all-students", { credentials: "include" });
    if (res.ok) setStudents((await res.json()).students);
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/classrooms/${classroomId}/assignments`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setClassAssignedQuizIds(new Set(data.class_assigned_quiz_ids));
      setStudentAssignments(data.student_assignments);
      setStudentNamesByQuiz(data.student_names_by_quiz || {});
    }
  };

  const handleToggleClassAssignment = async (quizId) => {
    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await fetch(`/api/classrooms/${classroomId}/assign-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ quiz_id: quizId }),
    });
    if (res.ok) {
      toast.success((await res.json()).message);
      await fetchAssignments();
    } else toast.error("❌ Failed to toggle assignment");
  };

  const handleToggleStudentAssignment = async (studentId) => {
    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await fetch(`/api/classrooms/${classroomId}/assign-quiz-to-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ quiz_id: selectedQuizId, student_id: studentId }),
    });
    if (res.ok) {
      toast.success((await res.json()).message);
      await fetchAssignments();
    } else toast.error("❌ Failed to assign/unassign");
  };

  if (loading) return <p>Loading quizzes...</p>;

  return (
    <div className="assign-quiz-page">
      <div className="assign-header">
        <h1>📝 Assign Quizzes</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard/instructor/classrooms")}>
          🔙 Back to Classrooms
        </button>
      </div>

      <div className="assign-quiz-grid">
        {allQuizzes.map((quiz) => {
          const assignedToClass = classAssignedQuizIds.has(quiz.id);
          const assignedStudents = studentNamesByQuiz[quiz.id] || [];

          return (
            <div key={quiz.id} className="assign-quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="assign-buttons">
                <button
                  className={`assign-btn ${assignedToClass ? "assigned" : ""}`}
                  onClick={() => handleToggleClassAssignment(quiz.id)}
                >
                  {assignedToClass ? "✅ Unassign from Class" : "🏫 Assign to Class"}
                </button>
                <button
                  className="student-modal-btn"
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setShowStudentModal(true);
                  }}
                >
                  🎯 Assign to Student
                </button>
              </div>
              {assignedStudents.length > 0 && (
                <p className="assigned-list">Assigned to: {assignedStudents.join(", ")}</p>
              )}
            </div>
          );
        })}
      </div>

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-drawer">
            <h2>🎯 Assign Students</h2>
            <button onClick={() => setShowStudentModal(false)} className="close-drawer">
              ❌
            </button>
            <ul className="student-list">
              {students.map((student) => {
                const assigned = studentAssignments[student.id]?.includes(selectedQuizId);
                return (
                  <li key={student.id} className="student-entry">
                    {student.username}
                    <button onClick={() => handleToggleStudentAssignment(student.id)}>
                      {assigned ? "❌ Unassign" : "➕ Assign"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}