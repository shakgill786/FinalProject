// react-vite/src/components/Dashboard/FeedbackModal.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkCreateFeedback,
  thunkLoadFeedback,
  thunkUpdateFeedback,
  thunkDeleteFeedback,
} from "../../redux/feedback";
import "./FeedbackModal.css";

export default function FeedbackModal({ student, classroom, onClose }) {
  const dispatch = useDispatch();

  // Local state
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("general");
  const [editMode, setEditMode] = useState(false);

  // Pull all quizzes from Redux
  const allQuizzes = useSelector((st) => Object.values(st.quizzes));

  // Feedback for this student & quiz
  const existingFeedback = useSelector((st) =>
    Object.values(st.feedback).find(
      (f) =>
        f.student_id === student.id &&
        (selectedQuizId === "general"
          ? f.quiz_id === null
          : f.quiz_id === Number(selectedQuizId))
    )
  );

  // On mount or when student/class changes, reload feedback & assignments
  const [classQuizIds, setClassQuizIds] = useState(new Set());
  const [studentQuizIds, setStudentQuizIds] = useState(new Set());

  useEffect(() => {
    dispatch(thunkLoadFeedback(student.id));
    setEditMode(false);
    setContent("");
    setSelectedQuizId("general");

    // Fetch classroom assignments endpoint, which returns both class‐level
    // and student‐level assigned quiz IDs in student_assignments
    fetch(`/api/classrooms/${classroom.id}/assignments`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setClassQuizIds(new Set(data.class_assigned_quiz_ids || []));
        const map = data.student_assignments || {};
        const raw =
          map[student.id] ?? map[String(student.id)] ?? [];
        setStudentQuizIds(new Set(raw));
      });
  }, [dispatch, student.id, classroom.id]);

  // Union of both assignment types
  const availableIds = new Set([
    ...classQuizIds,
    ...studentQuizIds,
  ]);

  // Filter the global quizzes list
  const availableQuizzes = allQuizzes.filter((q) =>
    availableIds.has(q.id)
  );

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await dispatch(
      thunkCreateFeedback({
        student_id: student.id,
        quiz_id:
          selectedQuizId === "general" ? null : Number(selectedQuizId),
        content: content.trim(),
      })
    );
    setSubmitting(false);
    if (!res.error) onClose();
    else alert("Error submitting feedback.");
  };

  const handleUpdate = async () => {
    if (!existingFeedback) return;
    setSubmitting(true);
    const res = await dispatch(
      thunkUpdateFeedback(existingFeedback.id, content.trim())
    );
    setSubmitting(false);
    if (!res.error) onClose();
    else alert("Failed to update feedback.");
  };

  const handleDelete = async () => {
    if (!existingFeedback) return;
    if (!window.confirm("Delete this feedback?")) return;
    await dispatch(thunkDeleteFeedback(existingFeedback.id));
    onClose();
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <h3>📝 Feedback for {student.username}</h3>

        <label className="quiz-select-label">
          Select quiz:
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            <option value="general">🗣️ General Feedback</option>
            {availableQuizzes.map((q) => (
              <option key={q.id} value={q.id}>
                📘 {q.title}
              </option>
            ))}
          </select>
        </label>

        {existingFeedback && !editMode ? (
          <div className="existing-feedback">
            <strong>Previous Feedback:</strong>
            <p>{existingFeedback.content}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setEditMode(true);
                  setContent(existingFeedback.content);
                }}
              >
                ✏️ Edit
              </button>
              <button onClick={handleDelete}>🗑️ Delete</button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={editMode ? handleUpdate : handleSubmit}
            className="feedback-form"
          >
            <textarea
              placeholder="Write feedback here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
            <div className="modal-buttons">
              <button type="button" onClick={onClose}>
                ❌ Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {editMode ? "💾 Save" : "✅ Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}