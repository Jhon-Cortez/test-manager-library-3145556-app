import type { ApiErrorBody } from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(
  /\/+$/,
  "",
);

const TOKEN_KEY = "ml.token";
const ROLE_KEY = "ml.role";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setSession(token: string, role: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: { field: string; issue: string }[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? [];
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const parsed = text ? safeJson(text) : null;

  if (!response.ok) {
    const errorBody: ApiErrorBody =
      parsed && typeof parsed === "object" && "code" in parsed && "message" in parsed
        ? (parsed as ApiErrorBody)
        : {
            code: "UNEXPECTED_ERROR",
            message: "Ocurrió un error inesperado. Intente de nuevo.",
          };
    throw new ApiError(response.status, errorBody);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
