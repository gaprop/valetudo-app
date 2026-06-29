import axios from "axios";
import type { ApiError } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({ baseURL: API_URL });

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
