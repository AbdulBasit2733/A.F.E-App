import { API_RESPONSE_PROPS } from "@/types/common-types";
import { removeTokenFromSecureStore, saveTokenToSecureStore } from "@/utils/token";
import apiSlice from "../apiSlice";
import { LOGIN_API_RESPONSE, LOGIN_PROPS, REGISTER_PROPS } from "./types";


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
  overrideExisting: false,
});

// Export hooks for convenience
export const {
  useRegisterUserFnMutation,
  useLazyCheckAuthFnQuery,
  useCheckAuthFnQuery,
  useLogoutUserFnMutation,
} = authApi;
