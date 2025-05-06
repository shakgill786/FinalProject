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
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState("general");
  const [editMode, setEditMode] = useState(false);

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
    setContent(""); // reset when switching quizzes
  }, [dispatch, student.id, selectedQuizId]);

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
      onClose();
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
      onClose();
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
    onClose();
  };

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <h3>📝 Feedback for {student.username}</h3>

        <label>
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
              <button onClick={() => {
                setEditMode(true);
                setContent(feedback.content);
              }}>✏️ Edit</button>
              <button onClick={handleDelete}>🗑️ Delete</button>
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
              <button type="button" onClick={onClose}>❌ Cancel</button>
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