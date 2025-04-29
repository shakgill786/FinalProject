import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AssignQuizPage.css";

export default function AssignQuizPage() {
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [classAssignedQuizIds, setClassAssignedQuizIds] = useState(new Set());
  const [studentAssignments, setStudentAssignments] = useState({});
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchQuizzes = async () => {
    const res = await fetch("/api/quizzes", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setAllQuizzes(data);
    }
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/users/all-students", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setStudents(data.students);
    }
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/classrooms/${classroomId}/assignments`, {
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      setClassAssignedQuizIds(new Set(data.class_assigned_quiz_ids));
      setStudentAssignments(data.student_assignments);
    }
    setLoading(false);
  };

  const handleAssignToClass = async (quizId) => {
    const res = await fetch(`/api/classrooms/${classroomId}/assign-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quiz_id: quizId }),
    });

    if (res.ok) {
      toast.success("🎯 Assigned to full class!");
      await fetchAssignments();
    } else {
      toast.error("❌ Failed to assign quiz.");
    }
  };

  const handleAssignToStudent = async (studentId) => {
    const res = await fetch(`/api/classrooms/${classroomId}/assign-quiz-to-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        quiz_id: selectedQuizId,
        student_id: studentId,
      }),
    });

    if (res.ok) {
      toast.success("🎯 Assigned to student!");
      await fetchAssignments();
    } else {
      toast.error("❌ Failed to assign.");
    }

    setShowStudentModal(false);
    setSelectedQuizId(null);
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

      <div className="quiz-list">
        {allQuizzes.map((quiz) => {
          const assignedToClass = classAssignedQuizIds.has(quiz.id);
          const assignedToStudents = Object.entries(studentAssignments)
            .filter(([_, quizIds]) => quizIds.includes(quiz.id))
            .map(([studentId]) => {
              const student = students.find((s) => s.id === parseInt(studentId));
              return student ? student.username : null;
            })
            .filter(Boolean);

          return (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>

              <div className="quiz-buttons">
                <button
                  disabled={assignedToClass}
                  onClick={() => handleAssignToClass(quiz.id)}
                  className={`assign-btn ${assignedToClass ? "assigned" : ""}`}
                >
                  {assignedToClass ? "✅ Assigned to Class" : "🏫 Assign to Class"}
                </button>

                <button
                  className="assign-student-btn"
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setShowStudentModal(true);
                  }}
                >
                  🎯 Assign to Student
                </button>
              </div>

              {assignedToStudents.length > 0 && !assignedToClass && (
                <p className="assigned-to">
                  Assigned to: {assignedToStudents.join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select a Student</h2>
            <button className="close-modal" onClick={() => setShowStudentModal(false)}>❌ Close</button>
            <ul className="student-list">
              {students.map((student) => (
                <li key={student.id}>
                  {student.username}
                  <button
                    onClick={() => handleAssignToStudent(student.id)}
                    className="assign-btn-small"
                  >
                    ➕ Assign
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
