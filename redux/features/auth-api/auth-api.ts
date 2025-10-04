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
    forgotPasswordFn: builder.mutation<API_RESPONSE_PROPS, { email: string }>({
      query: ({ email }) => ({
        url: `/users/forgot-password`,
        method: "POST",
        body: email,
      }),
    }),
  }),
  overrideExisting: true,
});

// Export hooks for convenience
export const { useRegisterUserFnMutation } = authApi;
