import useSWR, { Fetcher } from "swr";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

/**
 * Hook para realizar peticiones autenticadas con manejo de refresh token automático.
 * Usa SWR para caché y revalidación.
 */
export function useAuthFetch<T = any>(url: string) {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const fetcher: Fetcher<T, string> = async (u) => {
    // Primer intento con el accessToken actual
    let res = await fetch(u, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Si expiró, intento refrescar el token
    if (res.status === 401) {
      const ok = await refreshAccessToken?.();
      if (!ok) {
        toast.error("Sesión expirada. Iniciá sesión nuevamente.");
        throw new Error("Session expirada");
      }

      // Segundo intento con el nuevo token
      res = await fetch(u, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });
    }

    if (!res.ok) {
      if (res.status === 401) {
        logout();
        throw new Error("No autorizado");
      }
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || "Error de red");
    }

    return res.json();
  };

  const { data, error, mutate } = useSWR<T>(url, fetcher);

  return {
    data,
    isLoading: !data && !error,
    isError: Boolean(error),
    mutate,
  };
}
