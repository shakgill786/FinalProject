import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InstructorStudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/students", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch students", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="instructor-student-list">
      <ul>
        {students.map((student) => (
          <li key={student.id} className="student-entry">
            <button
              onClick={() => navigate(`/dashboard/instructor/students/${student.id}`)}
            >
              👤 {student.username}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
