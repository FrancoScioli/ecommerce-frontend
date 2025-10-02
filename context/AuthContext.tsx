"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import Spinner from "@/components/ui/Spinner"

interface AuthContextValue {
  userId: number | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (jwt: string, refreshToken?: string) => void
  logout: () => void
  userEmail: string | null
  userRole: string | null
  refreshAccessToken: () => Promise<boolean>,
  userFirstName: string | null
  userLastName: string | null
}

const AuthContext = createContext<AuthContextValue>({
  userId: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
  userEmail: null,
  userRole: null,
  refreshAccessToken: async () => false,
  userFirstName: null,
  userLastName: null
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [userFirstName, setUserFirstName] = useState<string | null>(null)
  const [userLastName, setUserLastName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken")
    const storedRefresh = localStorage.getItem("refreshToken")

    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken)
        setAccessToken(storedToken)
        setRefreshToken(storedRefresh)
        setUserEmail(decoded.email || null)
        setUserRole(decoded.role || null)
        setUserId(decoded.sub ? Number(decoded.sub) : null)
        setUserFirstName(decoded.firstName || null);
        setUserLastName(decoded.lastName || null);
      } catch (err) {
        console.error("Token inválido", err)
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  const login = (jwt: string, rt?: string) => {
    localStorage.setItem("accessToken", jwt)
    setAccessToken(jwt)

    if (rt) {
      localStorage.setItem("refreshToken", rt)
      setRefreshToken(rt)
    }

    try {
      const payload: any = jwtDecode(jwt)
      setUserEmail(payload.email)
      setUserRole(payload.role)
      setUserId(payload.sub ? Number(payload.sub) : null)
      setUserFirstName(payload.firstName || null);
      setUserLastName(payload.lastName || null);
    } catch {
      setUserEmail(null)
      setUserRole(null)
      router.push("/login")
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setAccessToken(null)
    setRefreshToken(null)
    setUserEmail(null)
    setUserId(null)
    setUserRole(null)
    setUserFirstName(null)
    setUserLastName(null)
    router.push("/login")
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`

      let res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 400 || res.status === 401) {
        res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
      }

      if (!res.ok) return false

      const { accessToken: newToken, refreshToken: newRefresh } = await res.json()

      localStorage.setItem("accessToken", newToken)
      if (newRefresh) {
        localStorage.setItem("refreshToken", newRefresh)
        setRefreshToken(newRefresh)
      }
      setAccessToken(newToken)

      const payload: any = jwtDecode(newToken)
      setUserEmail(payload.email)
      setUserRole(payload.role)
      setUserId(payload.sub ? Number(payload.sub) : null)

      return true
    } catch {
      return false
    }
  }

  const isAuthenticated = Boolean(accessToken)
  if (isLoading) return <Spinner />

  return (
    <AuthContext.Provider
      value={{
        userId,
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
        userEmail,
        userRole,
        refreshAccessToken,
        userFirstName,
        userLastName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  return useContext(AuthContext)
}
