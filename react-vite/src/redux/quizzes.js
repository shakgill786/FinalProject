const LOAD_QUIZZES = "quizzes/LOAD_QUIZZES";
const DELETE_QUIZ = "quizzes/DELETE_QUIZ";

// Action Creators
export const loadQuizzes = (quizzes) => ({
  type: LOAD_QUIZZES,
  quizzes,
});

export const removeQuiz = (quizId) => ({
  type: DELETE_QUIZ,
  quizId,
});

// Thunks
export const getAllQuizzes = () => async (dispatch) => {
  const res = await fetch("/api/quizzes");
  if (res.ok) {
    const data = await res.json();
    dispatch(loadQuizzes(data));
  }
};

export const deleteQuizThunk = (quizId) => async (dispatch) => {
  const res = await fetch(`/api/quizzes/${quizId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    dispatch(removeQuiz(quizId));
  }
};

const initialState = {};

export default function quizzesReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_QUIZZES:
      const newState = {};
      action.quizzes.forEach((quiz) => {
        newState[quiz.id] = quiz;
      });
      return newState;
    case DELETE_QUIZ:
      const updatedState = { ...state };
      delete updatedState[action.quizId];
      return updatedState;
    default:
      return state;
  }
}
