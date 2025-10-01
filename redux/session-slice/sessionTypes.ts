export interface Session {
  _id: string;
  creator_id: string;
  description: string;
  dateTimes: string[]; // An array of dates, where each item is a string representing a date
  mode: string;
  sessionType: string;
  thumbnail: string;
  title: string;
  price:string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SessionsResponse {
  data: Session[];
  message: string;
  success: boolean;
}
