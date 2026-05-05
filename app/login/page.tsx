"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"
import { JwtPayload } from "@/types/Auth"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Credenciales inválidas")
      }

      const { accessToken, refreshToken } = await res.json()
      const payload: JwtPayload = jwtDecode(accessToken)

      login(accessToken, refreshToken)
      toast.success("¡Bienvenido!")

      if (payload.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push(redirect)
      }
    } catch {
      toast.error("Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
        <div className="mt-4 text-center">
          ¿No tenés cuenta?{" "}
          <Link
            href={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-blue-600 hover:underline"
          >
            Creá una aquí
          </Link>
        </div>
      </form>
    </div>
  )
}
