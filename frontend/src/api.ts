import axios from "axios";
import type { ApiError } from "./types";
import { API_URL } from "./env";

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
