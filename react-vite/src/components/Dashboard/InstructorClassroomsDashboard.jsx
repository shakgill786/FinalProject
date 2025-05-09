// react-vite/src/components/Dashboard/InstructorClassroomsDashboard.jsx

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
  const [assignmentsMap, setAssignmentsMap] = useState({});
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

  // delete‐confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteClassroomId, setDeleteClassroomId] = useState(null);
  const [deleteClassroomName, setDeleteClassroomName] = useState("");

  const dispatch = useDispatch();
  const feedback = useSelector((st) => st.feedback);
  const user = useSelector((st) => st.session.user);
  const navigate = useNavigate();

  // 1) Fetch classrooms + preload feedback + assignments
  useEffect(() => {
    (async function loadAll() {
      const res = await fetch("/api/classrooms/?include=quizzes", {
        credentials: "include",
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setClassrooms(data);

      // preload feedback for every student
      data.flatMap((cls) => cls.students || []).forEach((s) => {
        dispatch(thunkLoadFeedback(s.id));
      });

      // fetch assignments for each classroom
      await Promise.all(
        data.map(async (cls) => {
          try {
            const aRes = await fetch(
              `/api/classrooms/${cls.id}/assignments`,
              { credentials: "include" }
            );
            if (!aRes.ok) throw new Error();
            const aData = await aRes.json();
            setAssignmentsMap((m) => ({ ...m, [cls.id]: aData }));
          } catch {
            // ignore
          }
        })
      );
      setLoading(false);
    })();
  }, [dispatch]);

  // 2) Classroom CRUD (create / update / delete) and drawer
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
      // reload
      setLoading(true);
      setClassrooms([]);
      setAssignmentsMap({});
      dispatch(thunkLoadFeedback()); // force refetch
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
      // reload data
      window.location.reload();
    } else {
      toast.error("❌ Update failed.");
    }
  };

  // Delete via polished modal
  const handleDeleteClick = (id, name) => {
    setDeleteClassroomId(id);
    setDeleteClassroomName(name);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    await fetch("/api/csrf/restore", { credentials: "include" });
    const res = await fetch(`/api/classrooms/${deleteClassroomId}`, {
      method: "DELETE",
      headers: { "X-CSRFToken": getCookie("csrf_token") },
      credentials: "include",
    });
    if (res.ok) {
      toast.success("🗑️ Classroom deleted.");
      setShowDeleteModal(false);
      // reload
      window.location.reload();
    } else {
      toast.error("❌ Failed to delete classroom.");
    }
  };
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteClassroomId(null);
    setDeleteClassroomName("");
  };

  // Feedback‐specific handlers
  const handleDeleteFeedback = async (fbId) => {
    if (!window.confirm("Delete this feedback?")) return;
    await dispatch(thunkDeleteFeedback(fbId));
    toast.success("🗑️ Feedback deleted");
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

  if (loading) return <p>Loading classrooms…</p>;

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
          {classrooms.map((cls) => {
            const assignData = assignmentsMap[cls.id] || {
              class_assigned_quiz_ids: [],
              student_assignments: {},
            };
            const classIds = assignData.class_assigned_quiz_ids || [];
            const studMap = assignData.student_assignments || {};

            return (
              <div key={cls.id} className="classroom-card">
                <h2>{cls.name}</h2>
                <p>
                  <strong>{cls.students?.length || 0}</strong> students enrolled
                </p>

                <div className="classroom-buttons">
                  <button
                    onClick={() => {
                      setEditingId(cls.id);
                      setEditingName(cls.name);
                      setEditDrawerOpen(true);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/classrooms/${cls.id}/manage-students`)
                    }
                  >
                    🎯 Manage Students
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/instructor/classrooms/${cls.id}/assign-quizzes`
                      )
                    }
                  >
                    📝 Assign Quizzes
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cls.id, cls.name)}
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="student-feedback-section">
                  {cls.students?.map((student) => (
                    <div
                      key={student.id}
                      className="student-feedback-card"
                    >
                      <h4>👧 {student.username}</h4>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedClassroom(cls);
                          setShowFeedbackModal(true);
                        }}
                      >
                        💬 Give Feedback
                      </button>

                      {Object.values(feedback)
                        .filter((f) => {
                          if (f.student_id !== student.id) return false;
                          if (f.quiz_id === null) return true; // general
                          if (classIds.includes(f.quiz_id)) return true; // class‐wide
                          // student‐only:
                          return (
                            studMap[student.id] &&
                            studMap[student.id].includes(f.quiz_id)
                          );
                        })
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
            );
          })}
        </div>
      )}

      {/* edit‐drawer */}
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

      {/* feedback modal */}
      {showFeedbackModal && (
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

      {/* delete confirmation modal */}
      {showDeleteModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <p>
              Are you sure you want to delete “
              <strong>{deleteClassroomName}</strong>”?
            </p>
            <div className="confirm-modal-buttons">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                ❌ Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>
                ✅ Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}