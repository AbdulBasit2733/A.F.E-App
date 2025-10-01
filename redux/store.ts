import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/index";
import apiSlice from "./features/apiSlice";
import sessionReducer from "./session-slice/index";
import userReducer from "./user-slice/index";
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    session: sessionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Infer RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
