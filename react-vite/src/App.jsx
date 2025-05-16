import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import NavBar from "./components/NavBar/NavBar";
import AboutFooter from "./components/Footer/AboutFooter";

import QuizList from "./components/Quizzes/QuizList";
import TakeQuiz from "./components/Quizzes/TakeQuiz";
import CreateQuizForm from "./components/Quizzes/CreateQuizForm";
import CreateQuestionForm from "./components/Quizzes/CreateQuestionForm";
import InstructorDashboard from "./components/Dashboard/InstructorDashboard";
import EditQuizForm from "./components/Quizzes/EditQuizForm";
import ManageQuestions from "./components/Quizzes/ManageQuestions";
import InstructorClassroomsDashboard from "./components/Dashboard/InstructorClassroomsDashboard";
import AssignQuizPage from "./components/Dashboard/AssignQuizPage";
import StudentManagementPage from "./components/Dashboard/StudentManagementPage";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import Leaderboard from "./components/Dashboard/Leaderboard";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import UserProfile from "./components/Dashboard/UserProfile";
import About from "./components/About/About";

import { thunkAuthenticate } from "./redux/session";

export default function App() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((st) => st.session.user);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/csrf/restore", { credentials: "include" })
      .then(() => dispatch(thunkAuthenticate()))
      .catch(console.error);
  }, [dispatch]);

  if (sessionUser && ["/login", "/signup"].includes(location.pathname)) {
    const dest =
      sessionUser.role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard/student";
    return <Navigate to={dest} replace />;
  }

  return (
    <>
      <NavBar />

      <Routes>
        {/* ─── Instructor Routes ───────────────────────────── */}
        <Route path="/dashboard/instructor/quizzes/:quizId/edit" element={<EditQuizForm />} />
        <Route path="/dashboard/instructor/quizzes/:quizId/manage-questions" element={<ManageQuestions />} />
        <Route path="/quizzes/:quizId/add-question" element={<CreateQuestionForm />} />
        <Route path="/classrooms/:classroomId/manage-students" element={<StudentManagementPage />} />
        <Route path="/dashboard/instructor/classrooms/:classroomId/assign-quizzes" element={<AssignQuizPage />} />
        <Route path="/dashboard/instructor/classrooms" element={<InstructorClassroomsDashboard />} />
        <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
        <Route
          path="/create"
          element={
            sessionUser?.role === "instructor"
              ? <CreateQuizForm />
              : <Navigate to="/" replace />
          }
        />

        {/* ─── Public / Student Routes ─────────────────────── */}
        <Route path="/" element={<QuizList />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/quizzes/:quizId" element={<TakeQuiz />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about" element={<About />} />

        {/* ─── Profile ─────────────────────────────────────── */}
        <Route path="/profile" element={<UserProfile />} />
      </Routes>

      <AboutFooter />
    </>
  );
}