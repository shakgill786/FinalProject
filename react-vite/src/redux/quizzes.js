import { getCookie } from "../utils/csrf"; // make sure this file exists

// ─── Action Types ─────────────────────────────────────
const LOAD_QUIZZES = "quizzes/LOAD_QUIZZES";
const DELETE_QUIZ  = "quizzes/DELETE_QUIZ";

// ─── Action Creators ─────────────────────────────────
export const loadQuizzes = (quizzes) => ({
  type: LOAD_QUIZZES,
  quizzes,
});

export const removeQuiz = (quizId) => ({
  type: DELETE_QUIZ,
  quizId,
});

// ─── Thunks ───────────────────────────────────────────

// ✅ Get all quizzes
export const getAllQuizzes = () => async (dispatch) => {
  const res = await fetch("/api/quizzes", {
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(loadQuizzes(data));
  } else {
    const err = await res.json();
    console.error("❌ Failed to load quizzes:", err);
  }
};

// ✅ Delete a quiz (with CSRF protection)
export const deleteQuizThunk = (quizId) => async (dispatch) => {
  // Ensure CSRF cookie is set
  await fetch("/api/csrf/restore", { credentials: "include" });

  const res = await fetch(`/api/quizzes/${quizId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCookie("csrf_token"),
    },
  });

  if (res.ok) {
    dispatch(removeQuiz(quizId));
  } else {
    const err = await res.json();
    console.error("❌ Failed to delete quiz:", err);
  }
};

// ─── Reducer ──────────────────────────────────────────
const initialState = {};

export default function quizzesReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_QUIZZES: {
      const newState = {};
      action.quizzes.forEach((q) => {
        newState[q.id] = q;
      });
      return newState;
    }
    case DELETE_QUIZ: {
      const newState = { ...state };
      delete newState[action.quizId];
      return newState;
    }
    default:
      return state;
  }
}
