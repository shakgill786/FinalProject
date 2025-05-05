import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkCreateFeedback,
  thunkLoadFeedback,
} from "../../redux/feedback";
import "./FeedbackModal.css";

export default function FeedbackModal({ quiz, student, onClose }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(quiz?.id || "general");

  const feedback = useSelector((state) =>
    Object.values(state.feedback).find(
      (f) => f.student_id === student.id &&
        (selectedQuizId === "general"
          ? f.quiz_id === null
          : f.quiz_id === selectedQuizId)
    )
  );

  const allQuizzes = useSelector((state) => Object.values(state.quizzes));

  useEffect(() => {
    dispatch(thunkLoadFeedback(student.id));
  }, [dispatch, student.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await dispatch(
      thunkCreateFeedback({
        student_id: student.id,
        quiz_id: selectedQuizId === "general" ? null : selectedQuizId,
        content: content.trim(),
      })
    );

    if (res && !res.error) {
      setContent("");
      onClose();
    } else {
      alert("Error submitting feedback.");
    }

    setSubmitting(false);
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
            {allQuizzes.map((q) => (
              <option key={q.id} value={q.id}>
                📘 {q.title}
              </option>
            ))}
          </select>
        </label>

        {feedback && (
          <div className="existing-feedback">
            <strong>Previous Feedback:</strong>
            <p>{feedback.content}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write feedback here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>❌ Cancel</button>
            <button type="submit" disabled={submitting}>✅ Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
