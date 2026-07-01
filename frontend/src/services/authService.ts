import { api } from "../api";
import type { AuthUser, LoginRequest } from "../types";

export const authService = {
  async me(): Promise<AuthUser> {
    const response = await api.get<AuthUser>("/api/auth/me");
    return response.data;
  },

  async login(input: LoginRequest): Promise<AuthUser> {
    const response = await api.post<AuthUser>("/api/auth/login", input);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },
};
