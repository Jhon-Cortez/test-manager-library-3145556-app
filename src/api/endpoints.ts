import { request } from "./client";
import type {
  Book,
  Category,
  LoginResponse,
  Member,
  Paginated,
} from "./types";

export function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}

export function listCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export interface BookQuery {
  q?: string;
  category_id?: string;
  page?: number;
  size?: number;
}

export function listBooks(query: BookQuery = {}): Promise<Paginated<Book>> {
  return request<Paginated<Book>>(`/books${buildQuery(query)}`);
}

export function getBook(id: string): Promise<Book> {
  return request<Book>(`/books/${id}`);
}

export interface MemberQuery {
  q?: string;
  page?: number;
  size?: number;
}

export function listMembers(query: MemberQuery = {}): Promise<Paginated<Member>> {
  return request<Paginated<Member>>(`/members${buildQuery(query)}`);
}

export function createMember(payload: {
  full_name: string;
  document_number: string;
}): Promise<Member> {
  return request<Member>("/members", { method: "POST", body: payload });
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
