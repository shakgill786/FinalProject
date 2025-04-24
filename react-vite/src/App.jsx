// react-vite/src/App.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components
import NavBar from "./components/NavBar/NavBar";
import QuizList from "./components/Quizzes/QuizList";
import TakeQuiz from "./components/Quizzes/TakeQuiz";
import CreateQuizForm from "./components/Quizzes/CreateQuizForm";
import CreateQuestionForm from "./components/Quizzes/CreateQuestionForm";
import InstructorDashboard from "./components/Dashboard/InstructorDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import ManageQuestions from "./components/Quizzes/ManageQuestions";
import LoginForm from "./components/Auth/LoginForm";

// Thunks
import { thunkAuthenticate } from "./redux/session";

export default function App() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/csrf/restore", { credentials: "include" })
      .then(() => {
        console.log("✅ CSRF cookie restored");
        dispatch(thunkAuthenticate());
      })
      .catch((err) => console.error("❌ CSRF restore failed:", err));
  }, [dispatch]);

  // 🔄 Redirect from /login if already logged in
  if (sessionUser && location.pathname === "/login") {
    const target =
      sessionUser.role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard/student";
    return <Navigate to={target} replace />;
  }

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

        {/* Student Routes */}
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Routes>
    </>
  );
}
