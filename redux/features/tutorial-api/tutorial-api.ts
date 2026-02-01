import apiSlice from "../apiSlice";
import {
  GET_ALL_TUTORIALS_RESPONSE,
  GET_TUTORIAL_BY_ID_RESPONSE,
  TUTORIALS_QUERY_PARAMS,
} from "./types";

const tutorialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTutorialsFn: builder.query<
      GET_ALL_TUTORIALS_RESPONSE,
      TUTORIALS_QUERY_PARAMS
    >({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/tutorials/user/all-tutorials",
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder },
      }),
      providesTags: ["Tutorial"],
    }),
    // Get Tutorial By ID
    getTutorialByIdFn: builder.query<
      GET_TUTORIAL_BY_ID_RESPONSE,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/tutorials/user/tutorial/${id}`,
        method: "GET",
      }),
      providesTags: ["Tutorial"],
    }),
  }),
});

export const { useGetAllTutorialsFnQuery, useGetTutorialByIdFnQuery } = tutorialApi;
