import { API_RESPONSE_PROPS } from "@/types/common-types";

export interface LOGIN_API_RESPONSE extends API_RESPONSE_PROPS {
    token:string;
}

export interface LOGIN_PROPS {
    email:string;
    password:string;
}
export interface REGISTER_PROPS {
    firstname:string;
    lastname:string;
    email:string;
    password:string;
    dob:string;
    gender:string;
}