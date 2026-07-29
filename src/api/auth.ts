import { apiSendJson } from "./client";

export type LoginResponse = { token: string };

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiSendJson<LoginResponse>("/api/auth/login", "POST", { username, password });
}
