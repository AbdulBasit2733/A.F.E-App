import { getTokenFromSecureStore, saveTokenToSecureStore } from "@/utils/token";
import { BACKEND_URL } from "@/utils/utils";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { USER_PROPS } from "../features/user-api/types";
import { CHECK_AUTH_REPONSE, LOGIN_API_RESPONSE, LOGIN_PROPS } from "./authTypes";


// Auth slice state type
interface AuthState {
  user: USER_PROPS | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: undefined,
};

// Async thunk for login
export const loginUserFn = createAsyncThunk<
  LOGIN_API_RESPONSE,
  LOGIN_PROPS,
  { rejectValue: string }
>("auth/loginUser", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post<LOGIN_API_RESPONSE>(
      `${BACKEND_URL}/users/login-user`,
      formData
    );

    if (response.data.token) {
      await saveTokenToSecureStore(response.data?.token);
    }

    // console.log("Login User", response.data);
    

    return response.data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Login failed";
    return rejectWithValue(message);
  }
});

// Async thunk for checking authentication
export const checkAuth = createAsyncThunk<
  CHECK_AUTH_REPONSE,
  void,
  { rejectValue: { success: boolean; message: string } }
>("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const token = await getTokenFromSecureStore();

    if (!token) {
      return rejectWithValue({ success: false, message: "No token found"});
    }

    const response = await axios.get(
      `${BACKEND_URL}/users/auth/user-auth`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log("Check Auth", response.data);
    

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    const message =
      err.response &&
      err.response.data &&
      typeof err.response.data === "object" &&
      err.response.data !== null &&
      "message" in err.response.data
        ? (err.response.data as { message?: string }).message
        : "Authentication check failed";
    return rejectWithValue({
      success: false,
      message: message ?? "Authentication check failed",
    });
  }
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = undefined;
    },
    setUser: (state, action: PayloadAction<USER_PROPS>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUserFn.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(
        loginUserFn.fulfilled,
        (state, action: PayloadAction<LOGIN_API_RESPONSE>) => {
          state.isLoading = false;
          state.user = action.payload.success ? action.payload.user : null;
          state.isAuthenticated = action.payload.success ? true : false;
        }
      )
      .addCase(loginUserFn.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || "Login failed";
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.data : null;
        state.isAuthenticated = action.payload.success ? true : false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Authentication failed";
      });
  },
});

export const { logoutUser,setUser } = authSlice.actions;
export default authSlice.reducer;
