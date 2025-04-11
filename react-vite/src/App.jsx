import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import QuizList from "./components/Quizzes/QuizList";
import TakeQuiz from "./components/Quizzes/TakeQuiz";
import CreateQuizForm from "./components/Quizzes/CreateQuizForm";
import CreateQuestionForm from "./components/Quizzes/CreateQuestionForm";


export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/quizzes/:quizId" element={<TakeQuiz />} />
        <Route path="/create" element={<CreateQuizForm />} /> 
        <Route path="/quizzes/:quizId/add-question" element={<CreateQuestionForm />} />
        <Route path="/quizzes/:quizId/add-question" element={<CreateQuestionForm />} />
      </Routes>
    </>
  );
}
