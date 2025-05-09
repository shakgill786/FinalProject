import React, { useEffect, useState } from "react";
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
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackContent, setEditingFeedbackContent] = useState("");

  // ** NEW state for delete confirmation modal **
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteClassroomId, setDeleteClassroomId] = useState(null);
  const [deleteClassroomName, setDeleteClassroomName] = useState("");

  const dispatch = useDispatch();
  const feedback = useSelector((st) => st.feedback);
  const user = useSelector((st) => st.session.user);
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
      // preload feedback for each student
      data
        .flatMap((cls) => cls.students || [])
        .forEach((s) => dispatch(thunkLoadFeedback(s.id)));
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

  const updateClassroom = async () => {
    if (!editingName.trim()) return;
    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await fetch(`/api/classrooms/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ name: editingName }),
    });
    if (res.ok) {
      toast.success("✅ Classroom updated!");
      setEditDrawerOpen(false);
      setEditingId(null);
      setEditingName("");
      await fetchClassrooms();
    } else {
      toast.error("❌ Update failed.");
    }
  };

  // perform the actual DELETE request
  const deleteClassroom = async (id) => {
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

  // open the modal instead of window.confirm
  const handleDeleteClick = (id, name) => {
    setDeleteClassroomId(id);
    setDeleteClassroomName(name);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    if (deleteClassroomId) {
      await deleteClassroom(deleteClassroomId);
      setShowDeleteModal(false);
      setDeleteClassroomId(null);
      setDeleteClassroomName("");
    }
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteClassroomId(null);
    setDeleteClassroomName("");
  };

  // feedback handlers unchanged...
  const handleDeleteFeedback = async (fbId) => {
    if (window.confirm("Delete this feedback?")) {
      await dispatch(thunkDeleteFeedback(fbId));
      toast.success("🗑️ Feedback deleted");
    }
  };
  const handleUpdateFeedback = async (fbId) => {
    if (!editingFeedbackContent.trim()) return;
    const res = await dispatch(
      thunkUpdateFeedback(fbId, editingFeedbackContent)
    );
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
              <h2>{classroom.name}</h2>
              <p>
                <strong>{classroom.students?.length || 0}</strong> students
                enrolled
              </p>

              <div className="classroom-buttons">
                <button
                  onClick={() => {
                    setEditingId(classroom.id);
                    setEditingName(classroom.name);
                    setEditDrawerOpen(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/classrooms/${classroom.id}/manage-students`)
                  }
                >
                  🎯 Manage Students
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/instructor/classrooms/${classroom.id}/assign-quizzes`
                    )
                  }
                >
                  📝 Assign Quizzes
                </button>
                <button
                  onClick={() =>
                    handleDeleteClick(classroom.id, classroom.name)
                  }
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Student feedback section */}
              <div className="student-feedback-section">
                {classroom.students?.map((student) => (
                  <div
                    key={student.id}
                    className="student-feedback-card"
                  >
                    <h4>👧 {student.username}</h4>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setSelectedClassroom(classroom);
                        setShowFeedbackModal(true);
                      }}
                    >
                      💬 Give Feedback
                    </button>

                    {Object.values(feedback)
                      .filter(
                        (f) =>
                          f.student_id === student.id &&
                          (f.quiz_id === null ||
                            classroom.quizzes?.some((q) => q.id === f.quiz_id))
                      )
                      .map((f) => (
                        <div key={f.id} className="feedback-entry">
                          <strong>
                            {f.quiz_title || "🗣️ General Feedback"}
                          </strong>
                          {editingFeedbackId === f.id ? (
                            <>
                              <textarea
                                value={editingFeedbackContent}
                                onChange={(e) =>
                                  setEditingFeedbackContent(e.target.value)
                                }
                                rows={3}
                              />
                              <button
                                onClick={() => handleUpdateFeedback(f.id)}
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingFeedbackId(null);
                                  setEditingFeedbackContent("");
                                }}
                              >
                                ❌ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <p>{f.content}</p>
                              <small>
                                {new Date(f.created_at).toLocaleString()}
                              </small>
                              {user?.role === "instructor" && (
                                <div className="feedback-buttons">
                                  <button
                                    onClick={() => {
                                      setEditingFeedbackId(f.id);
                                      setEditingFeedbackContent(f.content);
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFeedback(f.id)}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit-drawers */}
      <div className={`edit-drawer ${editDrawerOpen ? "open" : ""}`}>
        <h3>✏️ Edit Classroom</h3>
        <input
          type="text"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          autoFocus
        />
        <div className="drawer-buttons">
          <button onClick={updateClassroom}>💾 Save</button>
          <button
            onClick={() => {
              setEditDrawerOpen(false);
              setEditingId(null);
              setEditingName("");
            }}
          >
            ❌ Cancel
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
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

      {/* ====== Delete Confirmation Modal ====== */}
      {showDeleteModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <p>
              Are you sure you want to delete the classroom “
              <strong>{deleteClassroomName}</strong>”?
            </p>
            <div className="confirm-modal-buttons">
              <button
                className="cancel-btn"
                onClick={handleCancelDelete}
              >
                ❌ Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirmDelete}
              >
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}