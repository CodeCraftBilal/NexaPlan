import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    sessionRevision?: number;
  }
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.sessionRevision = useAuthStore.getState().revision;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const state = useAuthStore.getState();
    const isAuthRequest = /^\/?auth\//.test(error.config?.url ?? "");
    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      error.config?.sessionRevision === state.revision
    ) {
      state.logout();
    }
    return Promise.reject(error);
  },
);

export function getApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return "We couldn’t connect to the server. Check your connection and try again.";
    if (error.response.status >= 500)
      return "The server is temporarily unavailable. Please try again shortly.";
    const message = error.response.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
