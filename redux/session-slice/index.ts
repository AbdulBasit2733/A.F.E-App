import { BACKEND_URL } from "@/utils/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Session, SessionsResponse } from "./sessionTypes";
import { getTokenFromSecureStore } from "@/utils/token";

export interface RegisteredSession extends Session {
  _id: string;
  selectedDate: string;
  originalPrice:string;
  discountedPrice:string
}
// Initial state setup
const initialState = {
  isLoading: true,
  sessions: [] as Session[],
  registeredSessions: [] as RegisteredSession[], // For storing registered sessions
};

// Fetch all sessions action
export const allSessions = createAsyncThunk<SessionsResponse, { signal?: AbortSignal }>(
  "sessions/allSessions",
  async ({ signal } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get<SessionsResponse>(
        `${BACKEND_URL}/api/v1/sessions/all-sessions`,
        {
          signal,
        }
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
        console.log("Request canceled:", error.message);
        return rejectWithValue({
          success: false,
          message: "Request was canceled",
        });
      }

      console.error("allSessions error:", error);
      return rejectWithValue({
        success: false,
        message: error?.response?.data || "Something went wrong",
      });
    }
  }
);

// Register session action
export const registerSession = createAsyncThunk(
  "session/register",
  async ({ formData, id, selectedDate, couponId, discountedPrice,originalPrice}, { rejectWithValue }) => {
    try {
      const token = await getTokenFromSecureStore();
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/forms/register-session/${id}`,
        { formData: { ...formData, selectedDate,couponId,discountedPrice, originalPrice } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; // If successful, return the data
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      return rejectWithValue({
        success: false,
        message: errorMessage,
      });
    }
  }
);

// Fetch all registered sessions action`
export const getAllRegisteredSessions = createAsyncThunk(
  "session/allRegisteredSessions",
  async ({ signal }: { signal: AbortSignal}, { rejectWithValue }) => {
    try {
      const token = await getTokenFromSecureStore();

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/users/user-registered-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );
      

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue({ success: false, message: "Request canceled" });
      }

      return rejectWithValue({
        success: false,
        message: error?.response?.data?.message || "Something went wrong",
      });
    }
  }
);


const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handling allSessions
    builder
      .addCase(allSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(allSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.success ? action.payload.data : [];
      })
      .addCase(allSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.sessions = [];
      });

    // Handling getAllRegisteredSessions
    builder
      .addCase(getAllRegisteredSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllRegisteredSessions.fulfilled, (state, action) => {
        // console.log('action', action.payload);
        
        state.isLoading = false;
        state.registeredSessions = action.payload.success ? action.payload.data : [];
      })
      .addCase(getAllRegisteredSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.registeredSessions = [];
      });
  },
});

export default sessionSlice.reducer;
