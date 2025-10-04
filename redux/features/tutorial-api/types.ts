import type { API_RESPONSE_PROPS } from "@/types/common-types";

// Base Tutorial Interface
export interface TUTORIALS_PROPS {
  _id: string;
  adminId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  creator_id: string;
  createdByModel: "Admin" | "User";
  createdAt?: string;
  updatedAt?: string;
}

// Pagination Interface
export interface PAGINATION_PROPS {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNextPage?: boolean;  // Optional: easier to check if more items exist
  hasPrevPage?: boolean;  // Optional: easier to check if previous page exists
}

// Query Parameters Interface
export interface TUTORIALS_QUERY_PARAMS {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// Response Interfaces
export interface GET_ALL_TUTORIALS_RESPONSE extends API_RESPONSE_PROPS {
  data: TUTORIALS_PROPS[];
  pagination?: PAGINATION_PROPS;
}

export interface GET_TUTORIAL_BY_ID_RESPONSE extends API_RESPONSE_PROPS {
  data: TUTORIALS_PROPS;
}
