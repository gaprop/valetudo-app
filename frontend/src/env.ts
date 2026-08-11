declare global {
  interface Window {
    VALETUDO_CONFIG?: {
      apiUrl?: string;
    };
  }
}

export const API_URL =
  window.VALETUDO_CONFIG?.apiUrl ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";
