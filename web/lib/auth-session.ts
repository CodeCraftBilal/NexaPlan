import axios from "axios";
import { api } from "@/lib/api";
import { useAuthStore, type User } from "@/stores/authStore";

let pending: Promise<void> | null = null;

export function isSessionUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<User>;
  return typeof user.id === "string" && typeof user.email === "string" && typeof user.name === "string" && typeof user.role === "string";
}

// React Strict Mode can initialize twice. Share the request and ignore any
// result superseded by a successful login, logout, or session expiration.
export function initializeAuth(): Promise<void> {
  if (pending) return pending;
  const { revision, setLoading } = useAuthStore.getState();
  setLoading(true);
  pending = (async () => {
    try {
      const response = await api.get("/auth/me");
      if (useAuthStore.getState().revision !== revision) return;
      if (!response.data.success || !isSessionUser(response.data.user)) {
        throw new Error("Invalid session response");
      }
      useAuthStore.getState().setUser(response.data.user);
    } catch (error) {
      if (useAuthStore.getState().revision !== revision) return;
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 404)) {
        useAuthStore.getState().setUser(null);
      } else {
        useAuthStore.getState().setSessionError("We couldn’t check your session. Make sure the server is running, then try again.");
      }
    } finally {
      pending = null;
    }
  })();
  return pending;
}
