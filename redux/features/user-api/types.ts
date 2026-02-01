import { API_RESPONSE_PROPS } from "@/types/common-types";

export interface Insurance {
  _id?: string;
  type: string | null;
  companyName: string | null;
}

export interface Investment {
  _id?: string;
  investmentType: string | null;
  amount: number | null;
}

export interface USER_PROPS {
  _id?: string;
  profilePic?:string;
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

export interface GET_USER_DETAILS_API_RESPONSE extends API_RESPONSE_PROPS {
  data: USER_PROPS;
}

export interface CONTACT {
  contactName: string;
  phoneNumbers: {
    label: string;
    number: string;
  }[];
  emails?: {
    label: string;
    email: string;
  }[];
}


export interface CONTACTS_API_RESPONSE extends API_RESPONSE_PROPS {
  data: CONTACT;
}
