import { getCookie } from "../utils/csrf";

// Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

// Thunks

// ✅ Authenticate current user (used on app load)
export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch("/api/auth/", {
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    if (!data.errors) {
      dispatch(setUser(data));
    }
  }
};

// ✅ Login thunk
export const thunkLogin = (credentials) => async (dispatch) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken, // ✅ Fixed
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return data;
  } else if (response.status < 500) {
    const errorData = await response.json();
    return errorData;
  } else {
    return { errors: ["Something went wrong. Please try again."] };
  }
};

// ✅ Signup thunk
export const thunkSignup = (userInfo) => async (dispatch) => {
  const csrfToken = getCookie("csrf_token");

  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken, // ✅ Fixed
    },
    credentials: "include",
    body: JSON.stringify(userInfo),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return data;
  } else if (response.status < 500) {
    const errorData = await response.json();
    return errorData;
  } else {
    return { errors: ["Something went wrong. Please try again."] };
  }
};

// ✅ Logout thunk
export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout", { credentials: "include" });
  dispatch(removeUser());
};

// Reducer
const initialState = { user: null };

export default function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}
