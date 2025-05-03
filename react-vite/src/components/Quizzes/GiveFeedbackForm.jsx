import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkCreateFeedback } from "../../redux/feedback";

export default function GiveFeedbackForm({ quizId, studentId, onSuccess }) {
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const feedbackData = {
      student_id: studentId,
      quiz_id: quizId,
      content: content.trim(),
    };

    if (!feedbackData.content) {
      alert("Please enter feedback.");
      return;
    }

    const res = await dispatch(thunkCreateFeedback(feedbackData));
    if (res && !res.error) {
      setContent("");
      if (onSuccess) onSuccess();
    } else {
      alert("Could not submit feedback.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="give-feedback-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your feedback here..."
        required
      />
      <button type="submit">✅ Submit Feedback</button>
    </form>
  );
}