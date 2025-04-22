// src/redux/quizzes.js
const LOAD_QUIZZES = "quizzes/LOAD_QUIZZES";

export const loadQuizzes = (quizzes) => ({
  type: LOAD_QUIZZES,
  quizzes,
});

export const getAllQuizzes = () => async (dispatch) => {
  const res = await fetch("/api/quizzes");
  if (res.ok) {
    const data = await res.json();
    dispatch(loadQuizzes(data));
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
    default:
      return state;
  }
}
