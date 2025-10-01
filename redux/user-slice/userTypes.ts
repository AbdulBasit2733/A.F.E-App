export interface Insurance {
    type: string | null;
    companyName: string | null;
  }
  
  export interface Investment {
    investmentType: string | null;
    amount: number | null;
  }
  
  export interface BasicUserInfo {
    _id: string;
    firstname: string;
    lastname: string;
    dob: string;
    gender: string;
    email: string;
    isVerified: boolean;
    deleteToken?: string | null;
    deleteTokenExpiry?: string | null;
  }
  
  export interface UserDetails {
    _id: string;
    userId: BasicUserInfo;
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

  
  export interface GetUserDetailsResponse {
    success: boolean;
    message: string;
    data: UserDetails | null;
  }

  export interface UserState {
    isLoading:boolean,
    user: UserDetails | null
  }
  