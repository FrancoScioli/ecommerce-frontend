import { useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export function useFetchWithRefresh() {
  const { logout, refreshAccessToken } = useAuth();
  // evitar refresh simultáneos
  const refreshInFlight = useRef<Promise<boolean> | null>(null);

  const withAuthHeaders = (options: RequestInit = {}): RequestInit => {
    const token = localStorage.getItem("accessToken") || "";
    const baseHeaders: HeadersInit = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    return {
      credentials: "include",
      ...options,
      headers: baseHeaders,
    };
  };

  const fetchWithRefresh = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let res = await fetch(url, withAuthHeaders(options));

      if (res.status === 401) {
        if (!refreshInFlight.current) {
          refreshInFlight.current = (async () => {
            const ok = await refreshAccessToken();
            return ok;
          })();
        }

        const ok = await refreshInFlight.current.catch(() => false);
        refreshInFlight.current = null;

        if (!ok) {
          logout();
          throw new Error("Sesión expirada");
        }

        res = await fetch(url, withAuthHeaders(options));
      }

      return res;
    },
    [logout, refreshAccessToken]
  );

  return fetchWithRefresh;
}
