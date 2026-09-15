"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]);

  if (!mounted) return null;

  return (
    <>
      {children}
    </>
  );
}
