import { useState, useEffect, useRef } from "react";
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
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("general");
  const [editMode, setEditMode] = useState(false);
  const [closing, setClosing] = useState(false);
  const modalRef = useRef();

  const feedback = useSelector((state) =>
    Object.values(state.feedback).find(
      (f) =>
        f.student_id === student.id &&
        (selectedQuizId === "general"
          ? f.quiz_id === null
          : f.quiz_id === Number(selectedQuizId))
    )
  );

  useEffect(() => {
    dispatch(thunkLoadFeedback(student.id));
    setEditMode(false);
    setContent("");

    const handleEsc = (e) => {
      if (e.key === "Escape") triggerClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [dispatch, student.id, selectedQuizId]);

  const triggerClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // match with animation duration
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await dispatch(
      thunkCreateFeedback({
        student_id: student.id,
        quiz_id: selectedQuizId === "general" ? null : Number(selectedQuizId),
        content: content.trim(),
      })
    );
    if (!res.error) {
      setContent("");
      triggerClose();
    } else {
      alert("Error submitting feedback.");
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!feedback) return;
    setSubmitting(true);
    const res = await dispatch(
      thunkUpdateFeedback(feedback.id, content.trim())
    );
    if (!res.error) {
      setEditMode(false);
      setContent("");
      triggerClose();
    } else {
      alert("Failed to update feedback.");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!feedback) return;
    const confirmed = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmed) return;
    await dispatch(thunkDeleteFeedback(feedback.id));
    setContent("");
    triggerClose();
  };

  return (
    <div className={`feedback-modal-overlay ${closing ? "fade-out" : ""}`}>
      <div className={`feedback-modal ${closing ? "closing" : ""}`} ref={modalRef}>
        <h3>📝 Feedback for {student.username}</h3>

        <label className="quiz-selector">
          Select quiz:
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            <option value="general">🗣️ General Feedback</option>
            {classroom?.quizzes?.map((q) => (
              <option key={q.id} value={q.id}>
                📘 {q.title}
              </option>
            ))}
          </select>
        </label>

        {feedback && !editMode ? (
          <div className="existing-feedback">
            <strong>Previous Feedback:</strong>
            <p>{feedback.content}</p>
            <div className="modal-buttons">
              <button className="edit-btn" onClick={() => {
                setEditMode(true);
                setContent(feedback.content);
              }}>✏️ Edit</button>
              <button className="delete-btn" onClick={handleDelete}>🗑️ Delete</button>
            </div>
          </div>
        ) : (
          <form onSubmit={editMode ? handleUpdate : handleSubmit}>
            <textarea
              placeholder="Write feedback here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
            <div className="modal-buttons">
              <button type="button" className="cancel-btn" onClick={triggerClose}>❌ Cancel</button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {editMode ? "💾 Save" : "✅ Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}