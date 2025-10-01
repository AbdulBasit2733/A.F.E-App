import { API_RESPONSE_PROPS } from "@/types/common-types";
interface Insurance {
  _id?: string;
  type: string | null;
  companyName: string | null;
}

interface Investment {
  _id?: string;
  investmentType: string | null;
  amount: number | null;
}
interface USER_PROPS {
  _id?: string;
  firstname: string;
  lastname: string;
  dob: string;
  gender: string;
  email: string;
  income: number;
  netWorth: number;
  aadharCard: string;
  panCard: string;
  insurances: Insurance[];
  investments: Investment[];
  country: string;
  phone: string;
  occupation: string;
  city: string;
  address: string;
}
export interface LOGIN_API_RESPONSE extends API_RESPONSE_PROPS {
  token: string;
  user: USER_PROPS;
}

export interface LOGIN_PROPS {
  email: string;
  password: string;
}

export interface CHECK_AUTH_REPONSE extends API_RESPONSE_PROPS {
  data:USER_PROPS
}
