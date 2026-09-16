"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { initializeAuth } from "@/lib/auth-session";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!useAuthStore.getState().isInitialized) void initializeAuth();
  }, []);

  return <>{children}</>;
}
