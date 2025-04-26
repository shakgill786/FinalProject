// src/components/Dashboard/StudentManagementPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./StudentManagementPage.css";

export default function StudentManagementPage() {
  const { classroomId } = useParams();
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    const res = await fetch("/api/users/all-students", { credentials: "include" });
    if (res.ok) {
      const { students } = await res.json();
      setAllStudents(students);
    }

    const res2 = await fetch(`/api/classrooms/${classroomId}`, { credentials: "include" });
    if (res2.ok) {
      const classroom = await res2.json();
      const ids = classroom.students.map(student => student.id);
      setEnrolledStudentIds(new Set(ids));
    }

    setLoading(false);
  };

  const handleAddStudent = async (studentId) => {
    const res = await fetch(`/api/classrooms/${classroomId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ student_id: studentId, action: "add" }),
    });

    if (res.ok) {
      toast.success("✅ Student added!");
      setEnrolledStudentIds(prev => new Set(prev).add(studentId));
    } else {
      toast.error("❌ Failed to add student.");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    const res = await fetch(`/api/classrooms/${classroomId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ student_id: studentId, action: "remove" }),
    });

    if (res.ok) {
      toast.info("🚪 Student removed.");
      setEnrolledStudentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    } else {
      toast.error("❌ Failed to remove student.");
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="student-management-page">
      <h1>🧑‍🎓 Manage Students</h1>
      <button
        onClick={() => navigate("/dashboard/instructor/classrooms")}
        className="back-button"
      >
        🔙 Back to Classrooms
      </button>

      {allStudents.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="students-list">
          {Array.isArray(allStudents) && allStudents.map((student) => (
            <div key={student.id} className="student-card">
              <span>{student.username}</span>

              {enrolledStudentIds.has(student.id) ? (
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveStudent(student.id)}
                >
                  ❌ Remove
                </button>
              ) : (
                <button
                  className="add-btn"
                  onClick={() => handleAddStudent(student.id)}
                >
                  ➕ Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
