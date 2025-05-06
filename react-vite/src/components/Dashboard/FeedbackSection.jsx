import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkLoadFeedback, thunkDeleteFeedback } from "../../redux/feedback";
import "./FeedbackSection.css";

export default function FeedbackSection({ studentId, quizId }) {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  const feedback = useSelector((state) =>
    Object.values(state.feedback).filter((fb) =>
      fb.student_id === studentId &&
      ((quizId === null && fb.quiz_id === null) || fb.quiz_id === quizId)
    )
  );

  useEffect(() => {
    if (studentId) dispatch(thunkLoadFeedback(studentId));
  }, [dispatch, studentId]);

  const handleDelete = async (feedbackId) => {
    await dispatch(thunkDeleteFeedback(feedbackId));
  };

  if (!feedback.length) return null;

  return (
    <div className="feedback-section">
      <h4>📋 Teacher Feedback</h4>
      <ul>
        {feedback.map((fb) => (
          <li key={fb.id} className="feedback-entry">
            <p>{fb.content}</p>
            {sessionUser?.role === "instructor" && (
              <button onClick={() => handleDelete(fb.id)}>🗑️ Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}