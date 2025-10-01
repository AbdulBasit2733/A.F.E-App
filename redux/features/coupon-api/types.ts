import { API_RESPONSE_PROPS } from "@/types/common-types";

export interface COUPON_PROPS {
  _id: string;
  name: string;
  code: string;
  discount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface GET_COUPON_BY_CODE_RESPONSE extends API_RESPONSE_PROPS {
    data: COUPON_PROPS
}