import { getCookie } from "../utils/csrf";

// ─── ACTION TYPES ─────────────────────────────────
const LOAD_FEEDBACK = "feedback/LOAD_FEEDBACK";
const ADD_FEEDBACK = "feedback/ADD_FEEDBACK";
const UPDATE_FEEDBACK = "feedback/UPDATE_FEEDBACK";
const DELETE_FEEDBACK = "feedback/DELETE_FEEDBACK";

// ─── ACTION CREATORS ──────────────────────────────
const loadFeedback = (feedbackList) => ({
  type: LOAD_FEEDBACK,
  feedbackList,
});

const addFeedback = (feedback) => ({
  type: ADD_FEEDBACK,
  feedback,
});

const updateFeedback = (feedback) => ({
  type: UPDATE_FEEDBACK,
  feedback,
});

const removeFeedback = (feedbackId) => ({
  type: DELETE_FEEDBACK,
  feedbackId,
});

// ─── THUNKS ───────────────────────────────────────
export const thunkLoadFeedback = (studentId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/feedback/student/${studentId}`, {
      credentials: "include",
    });
    if (!res.ok) throw res;
    const data = await res.json();
    dispatch(loadFeedback(data));
    return data;
  } catch (err) {
    console.error("Failed to load feedback:", err);
    return null;
  }
};

export const thunkCreateFeedback = (feedbackData) => async (dispatch) => {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify(feedbackData),
    });
    if (!res.ok) throw res;
    const data = await res.json();
    dispatch(addFeedback(data));
    return data;
  } catch (err) {
    const error = await err.json();
    console.error("Error creating feedback:", error);
    return error;
  }
};

export const thunkUpdateFeedback = (feedbackId, content) => async (dispatch) => {
  try {
    const res = await fetch(`/api/feedback/${feedbackId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw res;
    const data = await res.json();
    dispatch(updateFeedback(data));
    return data;
  } catch (err) {
    const error = await err.json();
    console.error("Error updating feedback:", error);
    return error;
  }
};

export const thunkDeleteFeedback = (feedbackId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/feedback/${feedbackId}`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrf_token"),
      },
      credentials: "include",
    });
    if (!res.ok) throw res;
    dispatch(removeFeedback(feedbackId));
    return true;
  } catch (err) {
    const error = await err.json();
    console.error("Error deleting feedback:", error);
    return error;
  }
};

// ─── REDUCER ──────────────────────────────────────
const initialState = {};

export default function feedbackReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_FEEDBACK: {
      const newState = { ...state };
      action.feedbackList.forEach((fb) => {
        newState[fb.id] = fb;
      });
      return newState;
    }
    case ADD_FEEDBACK: {
      return { ...state, [action.feedback.id]: action.feedback };
    }
    case UPDATE_FEEDBACK: {
      return { ...state, [action.feedback.id]: action.feedback };
    }
    case DELETE_FEEDBACK: {
      const newState = { ...state };
      delete newState[action.feedbackId];
      return newState;
    }
    default:
      return state;
  }
}