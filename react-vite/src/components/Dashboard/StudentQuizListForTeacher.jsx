import { useEffect, useState } from "react";
import FeedbackModal from "./FeedbackModal";
import "./StudentQuizListForTeacher.css";

export default function StudentQuizListForTeacher({ student }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const res = await fetch(`/api/quizzes/history/${student.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    };

    if (student?.id) fetchQuizzes();
  }, [student]);

  if (!student) return null;

  return (
    <div className="quiz-list-teacher">
      <h3>🧠 Quizzes taken by {student.username}</h3>
      {quizzes.length === 0 ? (
        <p>This student has not completed any quizzes yet.</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <strong>{quiz.title}</strong> - Score: {quiz.score}% - Date: {quiz.date}
              <button onClick={() => setSelectedQuiz(quiz)}>💬 Give Feedback</button>
            </li>
          ))}
        </ul>
      )}

      {selectedQuiz && (
        <FeedbackModal
          student={student}
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  );
}
