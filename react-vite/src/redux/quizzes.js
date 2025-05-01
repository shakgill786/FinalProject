// action types
const LOAD_QUIZZES = "quizzes/LOAD_QUIZZES";
const DELETE_QUIZ  = "quizzes/DELETE_QUIZ";

// action creators
export const loadQuizzes   = (quizzes) => ({ type: LOAD_QUIZZES, quizzes });
export const removeQuiz    = (quizId)   => ({ type: DELETE_QUIZ, quizId });

// thunks
export const getAllQuizzes = () => async (dispatch) => {
  const res = await fetch("/api/quizzes", {
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(loadQuizzes(data));
  } else {
    const err = await res.json();
    console.error("Failed to load quizzes:", err);
  }
};

export const deleteQuizThunk = (quizId) => async (dispatch) => {
  const res = await fetch(`/api/quizzes/${quizId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) {
    dispatch(removeQuiz(quizId));
  }
};

// reducer
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
