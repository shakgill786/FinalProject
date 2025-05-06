// react-vite/src/components/Dashboard/InstructorClassroomsDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "../../utils/csrf";
import {
  thunkLoadFeedback,
  thunkDeleteFeedback,
  thunkUpdateFeedback,
} from "../../redux/feedback";
import FeedbackModal from "./FeedbackModal";
import "./InstructorClassroomsDashboard.css";

export default function InstructorClassroomsDashboard() {
  const [classrooms, setClassrooms] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackContent, setEditingFeedbackContent] = useState("");

  const dispatch = useDispatch();
  const feedback = useSelector((state) => state.feedback);
  const user = useSelector((state) => state.session.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    const res = await fetch("/api/classrooms/?include=quizzes", {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setClassrooms(data);
      const allStudents = data.flatMap((cls) => cls.students || []);
      allStudents.forEach((s) => dispatch(thunkLoadFeedback(s.id)));
    }
    setLoading(false);
  };

  const createClassroom = async () => {
    if (!newName.trim()) return;
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch("/api/classrooms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
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
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/classrooms/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ name: updatedName }),
    });

    if (res.ok) {
      toast.success("✅ Classroom name updated!");
      setEditingId(null);
      setEditingName("");
      await fetchClassrooms();
    } else {
      toast.error("❌ Failed to update classroom.");
    }
  };

  const deleteClassroom = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this classroom?");
    if (!confirmed) return;
    await fetch("/api/csrf/restore", { credentials: "include" });

    const res = await fetch(`/api/classrooms/${id}`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
    });

    if (res.ok) {
      toast.success("🗑️ Classroom deleted.");
      await fetchClassrooms();
    } else {
      toast.error("❌ Failed to delete classroom.");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const confirmed = window.confirm("Delete this feedback?");
    if (!confirmed) return;
    await dispatch(thunkDeleteFeedback(feedbackId));
    toast.success("🗑️ Feedback deleted");
  };

  const handleUpdateFeedback = async (feedbackId) => {
    if (!editingFeedbackContent.trim()) return;
    const res = await dispatch(thunkUpdateFeedback(feedbackId, editingFeedbackContent));
    if (!res.error) {
      setEditingFeedbackId(null);
      setEditingFeedbackContent("");
      toast.success("✅ Feedback updated");
    } else {
      toast.error("❌ Failed to update feedback");
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
                <div className="edit-classroom-controls">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button onClick={() => updateClassroom(classroom.id, editingName)}>✅ Done</button>
                    <button onClick={() => { setEditingId(null); setEditingName(""); }}>❌ Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2>{classroom.name}</h2>
                  <p><strong>{classroom.students?.length || 0}</strong> students enrolled</p>

                  <div className="classroom-buttons">
                    <button onClick={() => { setEditingId(classroom.id); setEditingName(classroom.name); }}>✏️ Edit</button>
                    <button onClick={() => navigate(`/classrooms/${classroom.id}/manage-students`)}>🎯 Manage Students</button>
                    <button onClick={() => navigate(`/dashboard/instructor/classrooms/${classroom.id}/assign-quizzes`)}>📝 Assign Quizzes</button>
                    <button onClick={() => deleteClassroom(classroom.id)}>🗑️ Delete</button>
                  </div>

                  <div className="student-feedback-section">
                    {classroom.students?.map((student) => (
                      <div key={student.id} className="student-feedback-card">
                        <h4>👧 {student.username}</h4>
                        <button onClick={() => {
                          setSelectedStudent(student);
                          setSelectedClassroom(classroom);
                          setShowFeedbackModal(true);
                        }}>
                          💬 Give Feedback
                        </button>

                        {Object.values(feedback)
                          .filter((f) =>
                            f.student_id === student.id &&
                            (f.quiz_id === null || classroom.quizzes?.some((q) => q.id === f.quiz_id))
                          )
                          .map((f) => (
                            <div key={f.id} className="feedback-entry">
                              <strong>{f.quiz_title || "🗣️ General Feedback"}</strong>
                              {editingFeedbackId === f.id ? (
                                <>
                                  <textarea
                                    value={editingFeedbackContent}
                                    onChange={(e) => setEditingFeedbackContent(e.target.value)}
                                    rows={3}
                                  />
                                  <button onClick={() => handleUpdateFeedback(f.id)}>💾 Save</button>
                                  <button onClick={() => {
                                    setEditingFeedbackId(null);
                                    setEditingFeedbackContent("");
                                  }}>❌ Cancel</button>
                                </>
                              ) : (
                                <>
                                  <p>{f.content}</p>
                                  <small>{new Date(f.created_at).toLocaleString()}</small>
                                  {user?.role === "instructor" && (
                                    <div className="feedback-buttons">
                                      <button onClick={() => {
                                        setEditingFeedbackId(f.id);
                                        setEditingFeedbackContent(f.content);
                                      }}>✏️ Edit</button>
                                      <button onClick={() => handleDeleteFeedback(f.id)}>🗑️ Delete</button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showFeedbackModal && selectedStudent && selectedClassroom && (
        <FeedbackModal
          student={selectedStudent}
          classroom={{
            id: selectedClassroom.id,
            quizzes: selectedClassroom.quizzes || [],
          }}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedStudent(null);
            setSelectedClassroom(null);
          }}
        />
      )}
    </div>
  );
}