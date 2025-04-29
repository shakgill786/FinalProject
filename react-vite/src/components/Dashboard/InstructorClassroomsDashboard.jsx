// src/components/Dashboard/InstructorClassroomsDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./InstructorClassroomsDashboard.css";

export default function InstructorClassroomsDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    const res = await fetch("/api/classrooms/", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setClassrooms(data);
    }
    setLoading(false);
  };

  const createClassroom = async () => {
    if (!newName.trim()) return;

    const res = await fetch("/api/classrooms/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      setNewName("");
      toast.success("🎉 Classroom created!");
      await fetchClassrooms();
    } else {
      toast.error("❌ Failed to create classroom.");
    }
  };

  const updateClassroom = async (id, updatedName) => {
    if (!updatedName.trim()) return;

    const res = await fetch(`/api/classrooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: updatedName }),
    });

    if (res.ok) {
      setEditingId(null);
      await fetchClassrooms();
    } else {
      toast.error("❌ Failed to update classroom.");
    }
  };

  const deleteClassroom = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this classroom?");
    if (!confirmed) return;

    const res = await fetch(`/api/classrooms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      toast.success("🗑️ Classroom deleted.");
      await fetchClassrooms();
    } else {
      toast.error("❌ Failed to delete classroom.");
    }
  };

  if (loading) return <p>Loading classrooms...</p>;

  return (
    <div className="classrooms-dashboard">
      <h1>🏫 Manage Your Classrooms</h1>

      <div className="create-classroom">
        <input
          type="text"
          value={newName}
          placeholder="New Classroom Name"
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={createClassroom}>➕ Create Classroom</button>
      </div>

      {classrooms.length === 0 ? (
        <p>No classrooms yet. Create one!</p>
      ) : (
        <div className="classroom-list">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="classroom-card">
              {editingId === classroom.id ? (
                <input
                  type="text"
                  defaultValue={classroom.name}
                  onBlur={(e) => updateClassroom(classroom.id, e.target.value)}
                  autoFocus
                />
              ) : (
                <>
                  <h2>{classroom.name}</h2>
                  <p><strong>{classroom.students?.length || 0}</strong> students enrolled</p>

                  <div className="classroom-buttons">
                    <button onClick={() => setEditingId(classroom.id)}>✏️ Edit</button>
                    <button onClick={() => navigate(`/classrooms/${classroom.id}/manage-students`)}>
                      🎯 Manage Students
                    </button>
                    <button onClick={() => navigate(`/dashboard/instructor/classrooms/${classroom.id}/assign-quizzes`)}>
                      📝 Assign Quizzes
                    </button>
                    <button onClick={() => deleteClassroom(classroom.id)}>🗑️ Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
