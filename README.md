# KnowBie

**Learn. Play. Conquer.**

**Live Site URL:** [https://finalproject-xl5u.onrender.com](https://finalproject-xl5u.onrender.com)
**GitHub Repository:** [https://github.com/shakgill786/FinalProject](https://github.com/shakgill786/FinalProject)

---

## Summary

KnowBie is an interactive quiz-based platform designed for young learners and their instructors. It enables instructors to create customized quizzes, assign them to classrooms or individual students, provide performance feedback, and view real-time student progress. Students can take quizzes, earn badges, climb the leaderboard, and receive personalized feedback.

---

## Features

* Role-based authentication (Instructor vs. Student)
* Quiz creation, editing, and deletion
* Add, manage, and delete quiz questions
* Classroom creation, student enrollment, and quiz assignment
* Individual and class-wide feedback
* Leaderboard and badge system
* Student dashboard with progress tracking and retake support

---

## Technologies Used

* **Frontend:** React, React Router, Redux, Vite, Toastify
* **Backend:** Flask, Flask SQLAlchemy, Flask-Migrate, Flask-WTF
* **Database:** PostgreSQL (Render), SQLite (local dev)
* **Auth:** Flask-Login, CSRF protection
* **Styling:** CSS3, responsive layout

---

## Installation & Running Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/shakgill786/FinalProject
   cd FinalProject
   ```
2. **Backend setup:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   flask db upgrade
   flask seed all
   ```
3. **Frontend setup:**

   ```bash
   cd react-vite
   npm install
   npm run dev
   ```

---

## Feature List Document

* Instructor:

  * Create, edit, and delete quizzes
  * Manage classroom rosters
  * Assign quizzes to individuals or whole classrooms
  * Leave feedback on quiz performance
  * Track student progress via dashboards

* Student:

  * Take quizzes with scoring feedback
  * Earn badges and track performance
  * View teacher feedback

---

## React Components List

* `App.jsx`
* `NavBar.jsx`
* `QuizList.jsx`
* `CreateQuizForm.jsx`
* `EditQuizForm.jsx`
* `TakeQuiz.jsx`
* `ManageQuestions.jsx`
* `CreateQuestionForm.jsx`
* `InstructorDashboard.jsx`
* `InstructorClassroomsDashboard.jsx`
* `AssignQuizPage.jsx`
* `StudentDashboard.jsx`
* `Leaderboard.jsx`
* `FeedbackModal.jsx`
* `FeedbackSection.jsx`
* `LoginForm.jsx`
* `SignupForm.jsx`

---

## Database Schema (Simplified)

* **users** (id, username, email, password, role)
* **quizzes** (id, title, description, grade\_level, user\_id)
* **questions** (id, quiz\_id, question\_text, options, answer)
* **quiz\_attempts** (id, user\_id, quiz\_id, score, timestamp)
* **classrooms** (id, name, user\_id)
* **classroom\_students** (id, classroom\_id, user\_id)
* **classroom\_quizzes** (id, classroom\_id, quiz\_id)
* **feedback** (id, student\_id, quiz\_id, content)

---

## Frontend Routes Document

* `/` → Public Quiz List
* `/login` → Login page
* `/signup` → Sign up
* `/create` → Create quiz (Instructor only)
* `/quizzes/:quizId` → Take quiz
* `/quizzes/:quizId/add-question` → Add question to quiz
* `/dashboard/instructor` → Instructor Dashboard
* `/dashboard/instructor/classrooms` → Manage classrooms
* `/dashboard/instructor/quizzes/:quizId/edit` → Edit quiz
* `/dashboard/instructor/quizzes/:quizId/manage-questions` → Manage quiz questions
* `/dashboard/instructor/classrooms/:classroomId/assign-quizzes` → Assign quizzes
* `/classrooms/:classroomId/manage-students` → Manage students
* `/dashboard/student` → Student dashboard
* `/leaderboard` → View leaderboard

---

## API Routes Document (Flask)

* `GET /api/csrf/restore` – Get CSRF token
* `POST /api/session` – Login
* `DELETE /api/session` – Logout
* `POST /api/users` – Signup
* `GET /api/quizzes` – List all quizzes
* `POST /api/quizzes` – Create quiz
* `PUT /api/quizzes/:id` – Update quiz
* `DELETE /api/quizzes/:id` – Delete quiz
* `POST /api/quizzes/:id/questions` – Add question
* `DELETE /api/quizzes/:quizId/questions/:questionId` – Delete question
* `GET /api/quizzes/:id/questions` – List quiz questions
* `POST /api/quizzes/:id/attempts` – Log quiz attempt
* `GET /api/quizzes/history` – Student quiz history
* `GET /api/leaderboard` – Global leaderboard
* `GET /api/classrooms/` – List instructor classrooms
* `POST /api/classrooms/` – Create classroom
* `DELETE /api/classrooms/:id` – Delete classroom
* `PUT /api/classrooms/:id` – Rename classroom
* `POST /api/classrooms/:id/students` – Add/remove student
* `POST /api/classrooms/:id/assignments` – Assign/unassign quizzes
* `GET /api/classrooms/:id/assignments` – Get assignments
* `GET /api/feedback/student/:id` – Get student feedback
* `POST /api/feedback` – Create feedback
* `PUT /api/feedback/:id` – Update feedback
* `DELETE /api/feedback/:id` – Delete feedback

---

## Redux Store Tree

```js
{
  session: {
    user: { id, username, email, role }
  },
  quizzes: {
    [quizId]: { id, title, description, grade_level, ... }
  },
  feedback: {
    [feedbackId]: { id, student_id, quiz_id, content, ... }
  },
  classrooms: {
    [classroomId]: { id, name, students: [...], quizzes: [...] }
  }
}
```

---

## Technical Implementation Details

* Role-based routing & redirects handled in `App.jsx`
* CSRF protection handled manually via token restoration + headers
* Uses `redux-thunk` for async API calls
* Conditional UI rendering based on roles and data presence
* Confetti + toast notifications for performance and events
* PostgreSQL deployed via Render, frontend via Vite

---

## Challenges Faced

* Ensuring consistent CSRF/session behavior across Render deployment
* Handling dynamic assignment logic between class vs. individual students
* Designing flexible feedback UI that supports general and quiz-specific content
* Preventing duplicate data on seed reruns (added checks)

---

## Future Features

* Real-time quiz results
* Quiz question editing
* AI-generated questions
* Class-to-class leaderboards
* Parent observer dashboards

---

Thanks for checking out KnowBie!
