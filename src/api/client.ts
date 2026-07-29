import type { ApiError } from "../types";
import { getToken } from "../auth/session";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

export class RequestError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.status = apiError.status;
    this.fieldErrors = apiError.fieldErrors;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = await response.json();
    } catch {
      apiError = { status: response.status, error: response.statusText, message: response.statusText };
    }
    throw new RequestError(apiError);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
  return handleResponse<T>(response);
}

export async function apiSendJson<T>(path: string, method: "POST" | "PUT", body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiSendForm<T>(path: string, method: "POST" | "PUT", formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<void>(response);
}

export function fileUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { url } = await apiSendForm<{ url: string }>("/api/uploads/image", "POST", formData);
  return url;
}
