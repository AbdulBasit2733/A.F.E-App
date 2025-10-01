import apiSlice from "../apiSlice";
import { GET_COUPON_BY_CODE_RESPONSE } from "./types";

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCouponByCodeFn: builder.query<
      GET_COUPON_BY_CODE_RESPONSE,
      { code: string }
    >({
      query: ({ code }) => ({
        url: `/coupons/get-coupon-by-code`,
        method: "GET",
        params: { code },
      }),
      providesTags:["Coupon"]
    }),
  }),
});

export const {
    useGetCouponByCodeFnQuery,
    useLazyGetCouponByCodeFnQuery
} = couponApi;
