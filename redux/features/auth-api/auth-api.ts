import { API_RESPONSE_PROPS } from "@/types/common-types";
import apiSlice from "../apiSlice";
import { REGISTER_PROPS } from "./types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUserFn: builder.mutation<
      API_RESPONSE_PROPS,
      { formData: REGISTER_PROPS }
    >({
      query: ({ formData }) => ({
        url: "/users/register-user",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

// Export hooks for convenience
export const { useRegisterUserFnMutation } = authApi;
