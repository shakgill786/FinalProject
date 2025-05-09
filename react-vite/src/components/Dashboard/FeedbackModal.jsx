// react-vite/src/components/Dashboard/FeedbackModal.jsx

import { useState, useEffect } from "react";
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

  // form state
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("general");
  const [editMode, setEditMode] = useState(false);

  // dropdown options
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  // reload feedback when student changes
  useEffect(() => {
    dispatch(thunkLoadFeedback(student.id));
    setEditMode(false);
    setContent("");
    setSelectedQuizId("general");
  }, [dispatch, student.id]);

  // build the “Select quiz” dropdown from class + student assignments
  useEffect(() => {
    async function loadAvailable() {
      try {
        const res = await fetch(
          `/api/classrooms/${classroom.id}/assignments`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        const classIds = data.class_assigned_quiz_ids || [];
        const studIds = data.student_assignments?.[student.id] || [];
        const allIds = Array.from(new Set([...classIds, ...studIds]));

        const qRes = await fetch("/api/quizzes/", { credentials: "include" });
        if (!qRes.ok) throw new Error();
        const allQuizzes = await qRes.json();

        setAvailableQuizzes(
          allQuizzes.filter((q) => allIds.includes(q.id))
        );
      } catch {
        setAvailableQuizzes(classroom.quizzes || []);
      }
    }
    loadAvailable();
  }, [classroom.id, classroom.quizzes, student.id]);

  // existing feedback for this student + quiz
  const existingFeedback = useSelector((st) =>
    Object.values(st.feedback).find(
      (f) =>
        f.student_id === student.id &&
        (selectedQuizId === "general"
          ? f.quiz_id === null
          : f.quiz_id === Number(selectedQuizId))
    )
  );

  // create or update on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      student_id: student.id,
      quiz_id: selectedQuizId === "general" ? null : Number(selectedQuizId),
      content: content.trim(),
    };
    const action = editMode
      ? thunkUpdateFeedback(existingFeedback.id, content.trim())
      : thunkCreateFeedback(payload);
    const res = await dispatch(action);
    setSubmitting(false);
    if (!res.error) {
      onClose();
    } else {
      alert("Error saving feedback.");
    }
  };

  // delete existing
  const handleDelete = async () => {
    if (!existingFeedback) return;
    if (!window.confirm("Delete this feedback?")) return;
    await dispatch(thunkDeleteFeedback(existingFeedback.id));
    onClose();
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <h3>📝 Feedback for {student.username}</h3>

        <label className="quiz-selector">
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
                type="button"
                className="edit-btn"
                onClick={() => {
                  setEditMode(true);
                  setContent(existingFeedback.content);
                }}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={handleDelete}
              >
                🗑️ Delete
              </button>
              {/* ← NEW “Done” BUTTON */}
              <button
                type="button"
                className="done-btn"
                onClick={onClose}
              >
                ✅ Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Write feedback here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting || !content.trim()}
              >
                {editMode ? "💾 Save" : "✅ Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}