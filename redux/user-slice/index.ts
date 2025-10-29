import { BACKEND_URL } from "@/utils/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { UserState } from "./userTypes";
import { getTokenFromSecureStore } from "@/utils/token";

// Initial state of the User
const initialState: UserState = {
  isLoading: true,
  user: null,
};

export const getUserDetails = createAsyncThunk(
  "users/userDetails",
  async ({ signal }: { signal: AbortSignal }, { rejectWithValue }) => {
    try {
      const token = await getTokenFromSecureStore();

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/users/user-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );
      // console.log("redux user-details", response.data);

      return response.data;
    } catch (error) {
      if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
        console.log("User details request canceled:", error.message);
        return rejectWithValue({
          success: false,
          message: "Request was canceled",
        });
      }

      console.error("User details error:", error);
      return rejectWithValue({
        success: false,
        message: error?.response?.data?.message || "Something went wrong",
      });
    }
  }
);
export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async (userData, { rejectWithValue }) => {
    try {
      const token = await getTokenFromSecureStore();
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/users/create-user-details`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Assuming the updated user details are returned
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error?.response?.data || "Something went wrong",
      });
    }
  }
);

export const saveUserContacts = createAsyncThunk(
  "user/saveContacts",
  async (contacts, { rejectWithValue }) => {
    // console.log("redux contacts",contacts);

    try {
      const token = await getTokenFromSecureStore();
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/users/save-contacts`,
        { contacts },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: error?.response?.data || "Something went wrong",
      });
    }
  }
);

// export const forgotPassword = createAsyncThunk(
//   "/user/forgot_password",
//   async (email, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${BACKEND_URL}/api/v1/users/forgot-password`,
//         { email } // No need to repeat `email: email` (ES6 shorthand syntax)
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Error in forgotPassword:", error);

//       return rejectWithValue({
//         success: false,
//         message: error.response?.data?.message || "Something went wrong",
//       });
//     }
//   }
// );

// User slice to manage state
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.data : null;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(saveUserContacts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveUserContacts.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(saveUserContacts.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export default userSlice.reducer;
