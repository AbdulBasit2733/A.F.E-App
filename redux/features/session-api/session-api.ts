import { API_RESPONSE_PROPS } from "@/types/common-types";
import apiSlice from "../apiSlice";
import type {
  ALL_REGISTERED_SESSION_RESPONSE,
  REGISTER_SESSION_PAYLOAD,
  REGISTER_SESSION_RESPONSE,
  SessionsResponse,
  SINGLE_SESSION_RESPONSE,
} from "./types";

export const sessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSessionsFn: builder.query<
      SessionsResponse,
      {
        page?: number;
        limit?: number;
        date?: string;
        sessionType?: string;
        mode?: string;
        search?:string;
      }
    >({
      query: ({ page = 1, limit = 10, date, sessionType, mode, search }) => {
        const params = new URLSearchParams();

        if (page) params.append("page", page.toString());
        if (search) params.append("search", search.toString());
        if (limit) params.append("limit", limit.toString());
        if (date) params.append("date", date);
        if (sessionType) params.append("sessionType", sessionType);
        if (mode) params.append("mode", mode);

        return {
          url: `/sessions/all-sessions?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Session"],
    }),

    getSessionByIdFn: builder.query<SINGLE_SESSION_RESPONSE, { id: string }>({
      query: ({ id }) => ({
        url: `/sessions/session/${id}`,
        method: "GET",
      }),
    }),

    registerSessionFn: builder.mutation<
      REGISTER_SESSION_RESPONSE,
      REGISTER_SESSION_PAYLOAD
    >({
      query: ({ formData, id }) => ({
        url: `/forms/register-session/${id}`,
        method: "POST",
        body: {
          formData,
        },
      }),
      invalidatesTags: ["Session", "RegisteredSession"],
    }),

    getAllRegisteredSessionsFn: builder.query<
      ALL_REGISTERED_SESSION_RESPONSE,
      void
    >({
      query: () => ({
        url:"/users/user-registered-sessions",
        method:"GET"
      }),
      providesTags: ["RegisteredSession"],
    }),
  }),
});

export const {
  useGetAllSessionsFnQuery,
  useGetSessionByIdFnQuery,
  useRegisterSessionFnMutation,
  useGetAllRegisteredSessionsFnQuery,
} = sessionApi;
