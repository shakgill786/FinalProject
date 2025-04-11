import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./TakeQuiz.css";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/quizzes/${quizId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [quizId]);

  const handleAnswer = (option) => {
    const isCorrect = option === questions[currentQ].answer;
    if (isCorrect) {
      setCorrect(correct + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        alert(`Quiz done! You got ${correct + (isCorrect ? 1 : 0)} right!`);
      }
    }, 700);
  };

  if (loading) return <p>Loading questions...</p>;
  if (!questions.length) {
    return (
      <div className="quiz-play-container">
        <h2>🎯 Quiz #{quizId}</h2>
        <p>No questions for this quiz yet!</p>
        <Link to={`/quizzes/${quizId}/add-question`} className="add-question-btn">
          ➕ Add Question
        </Link>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="quiz-play-container">
      <h2>🎯 Quiz #{quizId}</h2>
      <h3>{question.question_text}</h3>
      <div className="options">
        {question.options.map((opt, idx) => (
          <button key={idx} onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {showConfetti && <div className="confetti">🎉</div>}
      <Link to={`/quizzes/${quizId}/add-question`} className="add-question-btn">
        ➕ Add Another Question
      </Link>
    </div>
  );
}
