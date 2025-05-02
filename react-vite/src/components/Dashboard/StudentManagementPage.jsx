// src/components/Dashboard/StudentManagementPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/csrf";
import "./StudentManagementPage.css";

export default function StudentManagementPage() {
  const { classroomId } = useParams();
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    const [res1, res2] = await Promise.all([
      fetch("/api/users/all-students", { credentials: "include" }),
      fetch(`/api/classrooms/${classroomId}`, { credentials: "include" }),
    ]);

    if (res1.ok) {
      const { students } = await res1.json();
      setAllStudents(students);
    }

    if (res2.ok) {
      const classroom = await res2.json();
      const ids = classroom.students.map((s) => s.id);
      setEnrolledStudentIds(new Set(ids));
    }

    setLoading(false);
  };

  const modifyStudent = async (studentId, action) => {
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/classrooms/${classroomId}/students`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      body: JSON.stringify({ student_id: studentId, action }),
    });

    if (res.ok) {
      setEnrolledStudentIds((prev) => {
        const updated = new Set(prev);
        action === "add" ? updated.add(studentId) : updated.delete(studentId);
        return updated;
      });
      toast.success(`✅ Student ${action}ed!`);
    } else {
      toast.error(`❌ Failed to ${action} student.`);
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="student-management-page">
      <h1>🧑‍🎓 Manage Students</h1>
      <button
        className="back-button"
        onClick={() => navigate("/dashboard/instructor/classrooms")}
      >
        🔙 Back to Classrooms
      </button>

      <div className="students-list">
        {allStudents.map((student) => (
          <div key={student.id} className="student-card">
            <span>{student.username}</span>
            {enrolledStudentIds.has(student.id) ? (
              <button
                className="remove-btn"
                onClick={() => modifyStudent(student.id, "remove")}
              >
                ❌ Remove
              </button>
            ) : (
              <button
                className="add-btn"
                onClick={() => modifyStudent(student.id, "add")}
              >
                ➕ Add
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
