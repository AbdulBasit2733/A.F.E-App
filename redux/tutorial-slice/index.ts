import { BACKEND_URL } from "@/utils/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: true,
  tutorials: null,
};

export const allTutorials = createAsyncThunk(
  "tutorial/all-tutorial",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/tutorials/all-tutorials`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      rejectWithValue({
        success: false,
        message: error?.response?.data || "Something went Wrong",
      });
    }
  }
);

const tutorialSlice = createSlice({
  name: "tutorial",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(allTutorials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(allTutorials.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log(action.payload);
        state.tutorials = action.payload.data;
      })
      .addCase(allTutorials.rejected, (state) => {
        state.isLoading = false;
        state.tutorials = null;
      });
  },
});

export default tutorialSlice.reducer;
