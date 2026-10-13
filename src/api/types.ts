export type Role = "admin" | "librarian";

export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: Category;
  total_copies: number;
  available_copies: number;
  cover_key: string | null;
}

export interface Member {
  id: string;
  full_name: string;
  document_number: string;
  active_loans?: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: Role;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: { field: string; issue: string }[];
}
