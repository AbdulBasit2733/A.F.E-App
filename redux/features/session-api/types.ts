import { API_RESPONSE_PROPS } from "@/types/common-types";
import { Insurance, Investment, USER_PROPS } from "../user-api/types";

export interface Session {
  _id: string;
  creator_id: string;
  description: string;
  dateTimes: string[]; // An array of dates, where each item is a string representing a date
  mode: string;
  sessionType: string;
  thumbnail: string;
  title: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SessionsResponse extends API_RESPONSE_PROPS {
  data: Session[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}
export interface SINGLE_SESSION_RESPONSE extends API_RESPONSE_PROPS {
  data: Session;
}

export interface COUPON_PROPS {
  adminId: string;
  name: string;
  code: string;
  discount: number;
  expiryDate: string;
  isActive: string;
}

export interface REGISTERED_SESSION {
  _id: string;              // Mongo ObjectId string
  sessionId: string;        // sessionId as string (ObjectId converted)
  sessions: Session;        // nested Session object with session details
  userId: string;           // userId ObjectId string
  selectedDate: string;     // ISO date string
  couponId?: string;        // optional couponId ObjectId string
  coupon?: COUPON_PROPS;    // optional populated coupon details
  originalPrice: number;    // from Decimal128 converted to number
  discountedPrice: number;  // from Decimal128 converted to number
  paymentStatus: string;
  createdAt?: string;       // ISO string timestamps optional
  updatedAt?: string;
  __v?: number;
}

export interface ALL_REGISTERED_SESSION_RESPONSE extends API_RESPONSE_PROPS {
  data: REGISTERED_SESSION[];
}

export interface REGISTERED_SESSION_RESPONSE extends API_RESPONSE_PROPS {
  data: REGISTERED_SESSION;
}

export interface REGISTER_SESSION_FORM_DATA {
  income: number;
  netWorth: number;
  aadharCard: string;
  panCard: string;
  phone: string;
  insurances?: Insurance[];
  investments?: Investment[];
  selectedDate: string;
  couponId?: string;
  originalPrice: number;
  discountedPrice: number;
}

export interface REGISTER_SESSION_PAYLOAD {
  formData: REGISTER_SESSION_FORM_DATA;
  id: string; // sessionId from route params (string only, not array)
}

// Response with price details
export interface REGISTER_SESSION_RESPONSE extends API_RESPONSE_PROPS {
  priceDetails?: {
    originalPrice: number;
    discountedPrice: number;
  };
}
