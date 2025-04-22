import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import NavBar from "./components/NavBar/NavBar";
import QuizList from "./components/Quizzes/QuizList";
import TakeQuiz from "./components/Quizzes/TakeQuiz";
import CreateQuizForm from "./components/Quizzes/CreateQuizForm";
import CreateQuestionForm from "./components/Quizzes/CreateQuestionForm";
import InstructorDashboard from "./components/Dashboard/InstructorDashboard";
import ManageQuestions from "./components/Quizzes/ManageQuestions";
import LoginForm from "./components/Auth/LoginForm"; // ✅ Login route

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<QuizList />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/quizzes/:quizId" element={<TakeQuiz />} />

        {/* Instructor Routes */}
        <Route path="/create" element={<CreateQuizForm />} />
        <Route path="/quizzes/:quizId/add-question" element={<CreateQuestionForm />} />
        <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
        <Route
          path="/dashboard/instructor/quizzes/:quizId/manage-questions"
          element={<ManageQuestions />}
        />
      </Routes>
    </>
  );
}
console.log("✅ App loaded")