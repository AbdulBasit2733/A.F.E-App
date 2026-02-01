import { getTokenFromSecureStore } from "@/utils/token";
import { BACKEND_URL } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// console.log(BACKEND_URL);

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    credentials: "include",
    prepareHeaders: async (headers) => {
      const token = await getTokenFromSecureStore();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["Session", "Tutorial", "RegisteredSession", "User", "Coupon"],
});

export default apiSlice;
