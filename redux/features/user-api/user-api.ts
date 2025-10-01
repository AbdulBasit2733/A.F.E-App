import { API_RESPONSE_PROPS } from "@/types/common-types";
import apiSlice from "../apiSlice";
import type { CONTACT, USER_API_RESPONSE, USER_PROPS } from "./types";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserDetails: builder.query<USER_API_RESPONSE, void>({
      query: () => "/users/user-details",
      providesTags: ["User"],
    }),
    updateUserDetails: builder.mutation<API_RESPONSE_PROPS, {formData:USER_PROPS}>({
      query: ({formData}) => ({
        url: "/users/create-user-details",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    saveUserContacts: builder.mutation<API_RESPONSE_PROPS, {contacts:CONTACT[]}>({
      query: ({contacts}) => ({
        url: "/users/save-contacts",
        method: "POST",
        body: contacts
      }),
    }),
    forgotPassword: builder.mutation<API_RESPONSE_PROPS, {email:string}>({
      query: ({email}) => ({
        url: "/users/forgot-password",
        method: "POST",
        body: email
      }),
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useUpdateUserDetailsMutation,
  useSaveUserContactsMutation,
  useForgotPasswordMutation,
} = userApi;
