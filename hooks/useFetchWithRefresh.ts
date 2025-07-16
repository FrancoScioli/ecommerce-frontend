import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export function useFetchWithRefresh() {
  const { logout, refreshAccessToken } = useAuth();

  const fetchWithRefresh = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (res.status === 401) {
        const ok = await refreshAccessToken();
        if (!ok) {
          logout();
          throw new Error("Sesión expirada");
        }

        res = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      }

      return res;
    },
    [logout, refreshAccessToken]
  );

  return fetchWithRefresh;
}
